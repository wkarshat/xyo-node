"use strict";

let Node = require("./Node.js"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Sentinel extends Node {

  constructor(moniker, port, config) {
    console.log("Sentinel - constructor");

    super(moniker, port, config);
    this.entries = [];
    this.bridges = [];
  }

  detectSentinels(sentinels) {
    console.log("Sentinel - detectSentinels");
    this.peers = []; // remove old ones
    sentinels.forEach((sentinel) => {
      this.addPeer(
        sentinel.domain,
        sentinel.port
      );
    });
  }

  detectBridges(bridges) {
    console.log("Sentinel - detectBridges");
    this.bridges = []; // remove old ones
    bridges.forEach((bridge) => {
      this.addBridge(
        bridge.domain,
        bridge.port
      );
    });
  }

  addBridge(domain, port) {
    console.log("Sentinel - addBridge");
    let bridge = IOCLIENT.connect("{}:{}", domain, port);

    bridge.on("datarequests", (data) => {
      console.log(format("onDatarequests: {}"), data);
    });

    bridge.emit("datarequests", format("datarequests: hello[{},{}]", domain, port));
    this.bridges.push(bridge);
  }

  update() {
    super.update();
    this.detectSentinels();
    this.detectBridges();
  }

  status() {
    let status = super.status();

    return status;
  }
}

module.exports = Sentinel;
