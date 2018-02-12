'use strict';

const debug = require('debug')('Node'),
  Base = require('../Base'),
  Express = require('express'),
  format = require('string-format'),
  CRYPTO = require('crypto'),
  NET = require('net'),
  XYODATA = require('../../xyodata.js');

class Node extends Base {

  constructor(moniker, host, ports, config) {
    debug('constructor');
    let self;

    super();
    self = this;
    this.moniker = moniker;

    this.host = host;
    this.ports = ports;
    this.app = Express();
    this.app.listen(ports.api);
    this.server = NET.createServer((socket) => {
      debug('connected');
      socket.on('data', (data) => {
        self.in(data);
      });
    });
    this.server.listen(ports.pipe);
    this.peers = [];
    this.config = config;
    this.inData = null;
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

  in(buffer) {
    debug(format('in: {}', buffer.length));
    let object;

    if (this.inData) {
      this.inData = Buffer.concat([this.inData, buffer]);
    } else {
      this.inData = buffer;
    }

    object = XYODATA.BinOn.bufferToObj(this.inData, 0);

    if (object) {
      debug(format('in: {}', JSON.stringify(object)));
      this.inData = null;
    }

  }

  out(target, buffer) {
    debug(format('out: {},{},{}', target.host, target.port, buffer.length));
    let socket = NET.createConnection(target.port, target.host);

    socket.on('data', (data) => {
      debug('out:data: {}', data);
    }).on('connect', () => {
      debug('out:connect');
      socket.write(buffer);
      socket.destroy();
    }).on('end', () => {
      debug('out:done');
    });
  }

  addPeer(host, port) {
    debug(format('addPeer[{}, {}]', host, port));
    if (!(this.host === host && this.ports.pipe === port)) {
      this.peers.push({ host: host, port: port });
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

  initKeys(count) {
    debug('initKeys');
    this.keys = [];
    for (let i = 0; i < count; i++) {
      this.keys.push(this.generateKey());
    }
  }

  generateKey() {
    debug('generateKey');
    let diffHell = CRYPTO.createDiffieHellman(256);

    return {
      used: 0,
      public: diffHell.generateKeys('base64'),
      private: diffHell.getPrivateKey('base64')
    };
  }

  sign(payload) {
    debug('sign');
    let signatures = [];

    for (let i = 0; i < this.keys.length; i++) {
      let signer = CRYPTO.createSign('SHA256');

      signer.write(payload);
      signer.end();
      signatures.push(signer.sign(this.keys[i].key.private, 'hex'));
    }
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
      'config': this.config
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
