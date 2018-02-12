"use strict";

const debug = require("debug")("Bridge"),
  Node = require("./Node.js"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Bridge extends Node {

  constructor(moniker, port, config) {
    debug("constructor");
    super(moniker, port, config);
    this.entries = [];
    this.sentinels = [];
    this.archivists = [];
  }

  findSentinels(sentinels) {
    debug("detectSentinels");
    this.sentinels = []; // remove old ones
    sentinels.forEach((sentinel) => {
      this.addSentinel(
        sentinel.domain,
        sentinel.port
      );
    });
  }

  findArchivists(archivists) {
    debug("detectArchivinsts");
    this.archivists = []; // remove old ones
    archivists.forEach((archivist) => {
      this.addArchivist(
        archivist.domain,
        archivist.port
      );
    });
  }

  findBridges(bridges) {
    debug("detectBridges");
    this.peers = []; // remove old ones
    bridges.forEach((bridge) => {
      this.addPeer(
        bridge.domain,
        bridge.port
      );
    });
  }

  addSentinel(domain, port) {
    debug("addSentinel");
    let sentinel = IOCLIENT.connect("{}:{}", domain, port);

    sentinel.on("datarequests", (data) => {
      debug(format("onDatarequests: {}"), data);
    });

    sentinel.emit("datarequests", format("datarequests: hello[{},{}]", domain, port));
    this.sentinels.push(sentinel);
  }

  addArchivist(domain, port) {
    debug("addArchivists");
    let archivist = IOCLIENT.connect("{}:{}", domain, port);

    archivist.on("datarequests", (data) => {
      debug(format("onDatarequests: {}"), data);
    });

    archivist.emit("datarequests", format("datarequests: hello[{},{}]", domain, port));
    this.archivists.push(archivist);
  }

  update(config) {
    debug("update");
    super.update(config);
    if (this.sentinels.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
      this.findArchivists(config.archivists);
    }
  }

  status() {
    let status = super.status();

    return status;
  }
}

module.exports = Bridge;
