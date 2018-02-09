"use strict";

const debug = require("debug")("Sentinel"),
  Node = require("./Node.js"),
  XYODATA = require("../../xyodata.js"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Sentinel extends Node {

  constructor(moniker, port, config) {
    debug("Sentinel - constructor");

    super(moniker, port, config);
    this.entries = [];
    this.bridges = [];
  }

  findSentinels(sentinels) {
    debug("Sentinel - detectSentinels");
    this.peers = []; // remove old ones
    sentinels.forEach((sentinel) => {
      this.addPeer(
        sentinel.domain,
        sentinel.port
      );
    });
  }

  findBridges(bridges) {
    debug("Sentinel - detectBridges");
    this.bridges = []; // remove old ones
    bridges.forEach((bridge) => {
      this.addBridge(
        bridge.domain,
        bridge.port
      );
    });
  }

  addBridge(domain, port) {
    debug("Sentinel - addBridge");
    let bridge = IOCLIENT.connect("{}:{}", domain, port);

    bridge.on("datarequests", (data) => {
      debug(format("onDatarequests: {}"), data);
    });

    bridge.emit("datarequests", format("datarequests: hello[{},{}]", domain, port));
    this.bridges.push(bridge);
  }

  generateRandomEntry() {
    let peer = Math.floor(Math.random() * 10);

    if (peer < this.peers.length) {
      let entry = new XYODATA.Entry();

      this.peers[peer].emit(entry.toBuffer());
    }
  }

  update(config) {
    debug("Sentinel:update");
    super.update(config);
    if (this.bridges.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
    }
    this.generateRandomEntry();
  }

  status() {
    let status = super.status();

    return status;
  }
}

module.exports = Sentinel;
