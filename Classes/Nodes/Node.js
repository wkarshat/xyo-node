"use strict";

const debug = require("debug")("Node"),
  Base = require("../Base"),
  HTTP = require("http"),
  Express = require("express"),
  format = require("string-format"),
  IO = require("socket.io"),
  CRYPTO = require("crypto"),
  IOCLIENT = require("socket.io-client");

class Node extends Base {

  constructor(moniker, port, config) {
    super();
    this.moniker = moniker;

    this.port = port;
    this.app = Express();
    this.server = HTTP.Server(this.app);
    this.io = new IO(this.server);
    this.server.listen(port);
    this.peers = [];
    this.config = config;
    this.keys = [];
    Node.fromMoniker[moniker] = this;
    Node.fromPort[port] = this;
    this.initKeys(3);
  }

  addPeer(domain, port) {
    debug(format("Node - addPeer[{}, {}]", domain, port));
    let self = this, peer = IOCLIENT.connect(format("http://{}:{}", domain, port));

    peer.on("peers", (data) => {
      debug(format("onPeers[{}]: {}", self.constructor.name, data));
    });

    peer.emit("peers", format("addPeer[{}] [{}, {}]", self.constructor.name, domain, port));
    this.peers.push(peer);
  }

  update() {
    Node.updateCount++;
  }

  shutdown() {
    debug("Node - shutdown");
    delete Base.fromMoniker[this.moniker];
    delete Base.fromPort[this.port];
  }

  initKeys(count) {
    this.keys = [];
    for (let i = 0; i < count; i++) {
      this.keys.push(this.generateKey());
    }
  }

  generateKey() {
    let diffHell = CRYPTO.createDiffieHellman(256);

    return {
      used: 0,
      public: diffHell.generateKeys("base64"),
      private: diffHell.getPrivateKey("base64")
    };
  }

  sign(payload) {
    let signatures = [];

    for (let i = 0; i < this.keys.length; i++) {
      let signer = CRYPTO.createSign("SHA256");

      signer.write(payload);
      signer.end();
      signatures.push(signer.sign(this.keys[i].key.private, "hex"));
    }
  }

  getKeyUses(index) {
    return (index + 1) * (index + 1);
  }

  // Add one to the use number of each key, and if they have been used too much, regenerate
  spinKeys() {
    for (let i = 0; i < this.keys.length; i++) {
      let key = this.keys[i];

      key.used += 1;
      if (key.used > this.getKeyUses(i)) {
        this.addKey(key);
      }
    }
  }

  status() {
    debug("Node - status");
    return {
      "enabled": true,
      "peers": this.peers.length
    };
  }

  returnJSONStatus(req, res) {
    debug("Node - returnJSONStatus");
    let object = Base.fromPort[req.port];

    res.status(200).send(JSON.stringify(object.status()));
  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCount = 0;

module.exports = Node;
