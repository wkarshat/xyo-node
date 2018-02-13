'use strict';

const debug = require('debug')('Node'),
  Base = require('../Base'),
  Express = require('express'),
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
  }

  get(req, res) {
    debug('get');
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
      }
    }).on('close', () => {
      debug('in:close');
    }).on('end', () => {
      debug('in:end');
    });
  }

  onEntry(socket, entry) {
    debug(format('onEntry: {}', entry));
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
    debug(format("addEntryToLedger: {}", entry));
    this.entries.push(entry);
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

  sign(payload) {
    debug(format('sign: {}', payload.length));
    let keys = [], signature, signatures = [];

    for (let i = 0; i < this.keys.length; i++) {
      // debug(format('sign: {},{}', i, this.keys[i].public.length));
      let signer = CRYPTO.createSign('SHA256');

      signer.update(payload);
      signer.end();
      signature = signer.sign(this.keys[i].privatePem);
      signatures.push(signature);
      keys.push(this.keys[i].public);
      debug(format('sign: {},{}', i, signatures[i].length));
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
      if (key.used > this.getKeyUses(i)) {
        this.addKey(key);
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
      'ledger': {
        'entries': this.entries.length
      }
    };
  }

  returnJSONStatus(req, res) {
    debug('returnJSONStatus');
    res.status(200).send(JSON.stringify(this.status()));
  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCount = 0;

module.exports = Node;
