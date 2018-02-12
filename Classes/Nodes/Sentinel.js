"use strict";

const debug = require("debug")("Sentinel"),
  Node = require("./Node.js"),
  XYODATA = require("../../xyodata.js");

class Sentinel extends Node {

  constructor(moniker, host, port, config) {
    debug("constructor");

    super(moniker, host, port, config);
    this.entries = [];
    this.bridges = [];
  }

  findSentinels(sentinels) {
    debug("findSentinels");
    let key;

    this.peers = []; // remove old ones
    for (key in sentinels) {
      let sentinel = sentinels[key];

      if (!(sentinel.ports.pipe === this.ports.pipe && sentinel.host === this.host)) {
        this.addPeer(
          sentinel.host,
          sentinel.ports.pipe
        );
      }
    }
  }

  findBridges(bridges) {
    debug("findBridges");
    let key;

    this.bridges = []; // remove old ones
    for (key in bridges) {
      let bridge = bridges[key];

      this.addBridge(
        bridge.host,
        bridge.port
      );
    }
  }

  addBridge(host, port) {
    debug("addBridge");
    this.bridges.push({ host: host, port: port });
  }

  initiateBoundWitness() {
    debug("initiateBoundWitness");
    let peer = Math.floor(Math.random() * 10);

    if (peer < this.peers.length) {
      let entry = new XYODATA.Entry();

      this.out(this.peers[peer], entry.toBuffer(XYODATA.BinOn));
    }
  }

  update(config) {
    super.update(config);
    if (this.bridges.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
    }
    this.initiateBoundWitness();
  }

  status() {
    let status = super.status();

    status.type = "Sentinel";
    status.bridges = this.bridges.length;
    return status;
  }
}

module.exports = Sentinel;
