/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:06 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Node.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, February 15, 2018 2:16 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Node'),
  Base = require('../Base'),
  Express = require('express'),
  bodyParser = require('body-parser'),
  format = require('string-format'),
  CRYPTO = require('crypto'),
  URSA = require('ursa'),
  NET = require('net'),
  XYODATA = require('../../xyodata.js');

class Node extends Base {

  constructor(moniker, host, ports, config) {
    debug('constructor');
    let self;

    super();
    self = this;
    this.moniker = moniker;

    this.entries = [];

    this.host = host;
    this.ports = ports;
    this.app = Express();
    this.app.listen(ports.api);
    this.server = NET.createServer((socket) => {
      this.in(socket);
    });
    this.server.listen(ports.pipe);
    this.peers = [];
    this.config = config;
    this.keys = [];
    Node.fromMoniker[moniker] = this;
    Node.fromPort[ports.api] = this;
    Node.fromPort[ports.pipe] = this;
    this.initKeys(3);
    this.app.get('*', (req, res) => {
      self.get(req, res);
    });
    this.app.use(bodyParser.json());
    this.app.post('*', (req, res) => {
      if (!(req.body)) {
        return res.status(400).send("Empty body not allowed");
      }
      self.post(req, res);
    });
  }

  get(req, res) {
    debug('get');
    let contentType = req.headers['content-type'],
      pathParts = req.path.split("/");

    if (contentType && pathParts.length > 1) {
      let action = pathParts[1];

      switch (contentType) {
        case 'application/json':
          switch (action) {
            case "status":
              return this.returnJSONStatus(req, res);
            case "entries":
              return this.returnJSONEntries(req, res);
            default:
              return res.status(404).send(format("({}) Not Found", req.path));
          }
        default:
          return res.status(415).send(req.path);
      }
    }
    return res.status(404).send(req.path);
  }

  post(req, res) {
    debug('post');
    let contentType = req.headers['content-type'];

    if (!contentType) {
      return res.status(415).send(req.path);
    } else {
      switch (contentType) {
        case 'application/json':
          return this.returnJSONStatus(req, res);
        default:
          return res.status(415).send(req.path);
      }
    }
  }

  in(socket) {
    debug('in');
    let inData = null;

    socket.on('data', (buffer) => {
      debug('in:data: {}', buffer.length);
      let result;

      if (inData) {
        inData = Buffer.concat([inData, buffer]);
      } else {
        inData = buffer;
      }

      result = XYODATA.BinOn.bufferToObj(inData, 0);
      if (result.obj) {
        let obj = result.obj;

        switch (obj.map) {
          case "entry":
            this.onEntry(socket, obj);
            break;
          default:
            break;
        }
        inData = null;
      } else {
        debug('in:noobj');
      }
    }).on('close', () => {
      debug('in:close');
    }).on('end', () => {
      debug('in:end');
    });
  }

  onEntry(socket, entry) {
    debug(format("onEntry: {}"));
    let self = this;

    if (entry.p1signatures.length === 0) {
      debug("onEntry: P1");
      entry.p1Sign((payload) => {
        return self.sign(payload);
      }, () => {
        let buffer = entry.toBuffer();

        socket.write(buffer);
      });
    } else if (entry.p2signatures.length === 0) {
      debug("onEntry: P2");
      entry.p2Sign((payload) => {
        return self.sign(payload);
      },
      () => {
        let buffer = entry.toBuffer();

        socket.write(buffer);
        this.addEntryToLedger(entry);
      });
    } else {
      debug("onEntry: DONE");
      this.addEntryToLedger(entry);
    }
  }

  out(target, buffer) {
    debug(format('out: {},{},{}', target.host, target.port, buffer.length));

    let inData = null, socket = NET.createConnection(target.port, target.host);

    socket.on('data', (data) => {
      let result;

      if (inData) {
        inData = Buffer.concat([inData, data]);
      } else {
        inData = data;
      }

      result = XYODATA.BinOn.bufferToObj(inData, 0);

      if (result.obj) {
        let obj = result.obj;

        switch (obj.map) {
          case "entry":
            this.onEntry(socket, obj);
            break;
          default:
            break;
        }
        inData = null;
      }
    }).on('connect', () => {
      debug('out:connect');
      socket.write(buffer);
    }).on('end', () => {
      debug('out:done');
    }).on('error', (ex) => {
      debug(format('error:{}', ex));
    });
  }

  addPeer(host, ports) {
    debug(format('addPeer[{}, {}]', host, ports.pipe));
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.peers.push({ host: host, port: ports.pipe });
    }
  }

  update() {
    debug('update');
    Node.updateCount++;
  }

  shutdown() {
    debug('shutdown');
    delete Base.fromMoniker[this.moniker];
    delete Base.fromPort[this.port];
  }

  addEntryToLedger(entry) {
    debug("addEntryToLedger");
    if (this.entries.length > 0) {
      this.signHeadAndTail(this.entries[this.entries.length - 1]);
    }
    this.entries.push(entry);
  }

  signHeadAndTail(entry) {
    debug("signHeadAndTail");
    let payload, headKeys = this.keys.slice(0);

    this.spinKeys();

    entry.headKeys = this.publicKeysFromKeys(headKeys);
    entry.tailKeys = this.publicKeysFromKeys(this.keys);

    payload = entry.toBuffer();

    this.signHead(entry, payload, headKeys);
    this.signTail(entry, payload, this.keys);
  }

  signHead(entry, payload, keys) {
    debug("signHead");
    let result;

    result = this.sign(payload, keys);
    entry.headSignatures = result.signatures;
  }

  signTail(entry, payload, keys) {
    debug("signTail");
    let result;

    result = this.sign(payload, keys);
    entry.tailSignatures = result.signatures;
  }

  publicKeysFromKeys(keys) {
    let publicKeys = [];

    for (let i = 0; i < keys.length; i++) {
      publicKeys.push(keys[i].public);
    }

    return publicKeys;
  }

  initKeys(count) {
    debug('initKeys');
    this.keys = [];
    for (let i = 0; i < count; i++) {
      this.keys.push(this.generateKey());
    }
  }

  generateKey() {
    debug('generateKey');
    let key = URSA.generatePrivateKey(1024, 65537);

    debug(key.toPublicPem().toString().split('-----BEGIN PUBLIC KEY-----')[1].split('-----END PUBLIC KEY-----')[0].replace('\n', '').length);
    return {
      used: 0,
      publicPem: key.toPublicPem(),
      public: key.toPublicPem().toString().split('-----BEGIN PUBLIC KEY-----')[1].split('-----END PUBLIC KEY-----')[0].replace('\n', ''),
      privatePem: key.toPrivatePem(),
      ssh: key.toPublicSsh()
    };
  }

  sign(payload, signingKeys) {
    debug('sign:');
    let keys = [], signature, signatures = [], signKeys = signingKeys || this.keys;

    for (let i = 0; i < signKeys.length; i++) {
      // debug(format('sign: {},{}', i, this.keys[i].public.length));
      let signer = CRYPTO.createSign('SHA256');

      signer.update(payload);
      signer.end();
      signature = signer.sign(signKeys[i].privatePem).toString('hex');
      // debug(format('SIGLEN: {}', signature.length));
      signatures.push(signature);
      keys.push(signKeys[i].public);
      // debug(format('sign: {},{}', i, signatures[i].length));
    }
    return { signatures: signatures, keys: keys };
  }

  getKeyUses(index) {
    debug('getKeyUses');
    return (index + 1) * (index + 1);
  }

  // Add one to the use number of each key, and if they have been used too much, regenerate
  spinKeys() {
    debug('spinkKeys');
    for (let i = 0; i < this.keys.length; i++) {
      let key = this.keys[i];

      key.used += 1;
      if (key.used >= this.getKeyUses(i)) {
        this.keys[i] = this.generateKey();
      }
    }
  }

  status() {
    debug('status');
    return {
      'moniker': this.moniker,
      'enabled': true,
      'peers': this.peers.length,
      'host': this.host,
      'port': this.port,
      'config': this.config,
      'type': this.name,
      'ledger': {
        'entries': this.entries.length
      }
    };
  }

  returnJSONStatus(req, res) {
    debug('returnJSONStatus');
    res.status(200).send(JSON.stringify(this.status()));
  }

  returnJSONEntries(req, res) {
    debug('returnJSONItems');
    let pathParts = req.path.split("/"), id = null;

    if (pathParts.length > 2) {
      id = pathParts[2];
    }

    if (id && id.length > 0) {
      let entries = [this.entriesByP1Key[id], this.entriesByP2Key[id], this.entriesByHeadKey[id], this.entriesByTailKey[id]];

      if (entries) {
        return res.send({
          "id": id,
          "entries": this.entriesByKey[id]
        });
      }
      return res.status(404).send(format("({}) Not Found", id));
    } else {
      let results = [];

      for (let i = 0; i < this.entries.length && i < 50; i++) {
        results.push(this.entries[i]);
      }

      return res.send({
        "entries": results
      });
    }

  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCount = 0;

module.exports = Node;
