"use strict";

const debug = require("debug")("Bridge"),
  Node = require("./Node.js"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Bridge extends Node {

  constructor(moniker, domain, port, config) {
    debug("constructor");
    super(moniker, domain, port, config);
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

      if (!(sentinel.port === this.port && sentinel.domain === this.domain)) {
        this.addSentinel(
          sentinel.domain,
          sentinel.port
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

      if (!(archivist.port === this.port && archivist.domain === this.domain)) {
        this.addArchivist(
          archivist.domain,
          archivist.port
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

      if (!(bridge.port === this.port && bridge.domain === this.domain)) {
        this.addPeer(
          bridge.domain,
          bridge.port
        );
      }
    }
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

    status.type = "Bridge";
    status.sentinels = this.sentinels.length;
    status.archivists = this.archivists.length;

    return status;
  }
}

module.exports = Bridge;
