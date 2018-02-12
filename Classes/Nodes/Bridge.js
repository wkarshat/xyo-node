"use strict";

const debug = require("debug")("Bridge"),
  Node = require("./Node.js"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Bridge extends Node {

  constructor(moniker, host, port, config) {
    debug("constructor");
    super(moniker, host, port, config);
    this.entries = [];
    this.sentinels = [];
    this.archivists = [];
  }

  findSentinels(sentinels) {
    debug("findSentinels");
    let key;

    this.sentinels = []; // remove old ones
    for (key in sentinels) {
      let sentinel = sentinels[key];

      if (!(sentinel.ports.pipe === this.ports.pipe && sentinel.host === this.host)) {
        this.addSentinel(
          sentinel.host,
          sentinel.ports.pipe
        );
      }
    }
  }

  findArchivists(archivists) {
    debug("findArchivists");
    let key;

    this.archivists = []; // remove old ones
    for (key in archivists) {
      let archivist = archivists[key];

      if (!(archivist.ports.pipe === this.ports.pipe && archivist.host === this.host)) {
        this.addArchivist(
          archivist.host,
          archivist.ports.pipe
        );
      }
    }
  }

  findBridges(bridges) {
    debug("detectBridges");
    let key;

    this.peers = []; // remove old ones
    for (key in bridges) {
      let bridge = bridges[key];

      if (!(bridge.ports.pipe === this.ports.pipe && bridge.host === this.host)) {
        this.addPeer(
          bridge.host,
          bridge.ports.pipe
        );
      }
    }
  }

  addSentinel(host, port) {
    debug("addSentinel");
    let sentinel = IOCLIENT.connect("{}:{}", host, port);

    sentinel.on("datarequests", (data) => {
      debug(format("onDatarequests: {}"), data);
    });

    sentinel.emit("datarequests", format("datarequests: hello[{},{}]", host, port));
    this.sentinels.push(sentinel);
  }

  addArchivist(host, port) {
    debug("addArchivists");
    let archivist = IOCLIENT.connect("{}:{}", host, port);

    archivist.on("datarequests", (data) => {
      debug(format("onDatarequests: {}"), data);
    });

    archivist.emit("datarequests", format("datarequests: hello[{},{}]", host, port));
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

    status.type = "Bridge";
    status.sentinels = this.sentinels.length;
    status.archivists = this.archivists.length;

    return status;
  }
}

module.exports = Bridge;
