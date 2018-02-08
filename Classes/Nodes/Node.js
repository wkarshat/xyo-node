"use strict";

let Base = require("../Base"),
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
    Node.fromMoniker[moniker] = this;
    Node.fromPort[port] = this;
    this.generateKeys();
  }

  addPeer(domain, port) {
    console.log(format("Node - addPeer[{}, {}]", domain, port));
    let self = this, peer = IOCLIENT.connect(format("http://{}:{}", domain, port));

    peer.on("peers", (data) => {
      console.log(format("onPeers[{}]: {}", self.constructor.name, data));
    });

    peer.emit("peers", format("addPeer[{}] [{}, {}]", self.constructor.name, domain, port));
    this.peers.push(peer);
  }

  update() {
    Node.updateCount++;
  }

  shutdown() {
    console.log("Node - shutdown");
    delete Base.fromMoniker[this.moniker];
    delete Base.fromPort[this.port];
  }

  generateKeys() {
    let diffHell = CRYPTO.createDiffieHellman(256);

    this.pubKey = diffHell.generateKeys("base64");
    console.log("PubK: " + JSON.stringify(this.pubKey));

    this.privKey = diffHell.getPrivateKey("base64");
    console.log("PrivK: " + JSON.stringify(this.privKey));
  }

  status() {
    console.log("Node - status");
    return {
      "enabled": true,
      "peers": this.peers.length
    };
  }

  returnJSONStatus(req, res) {
    console.log("Node - returnJSONStatus");
    let object = Base.fromPort[req.port];

    res.status(200).send(JSON.stringify(object.status()));
  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCount = 0;

module.exports = Node;
