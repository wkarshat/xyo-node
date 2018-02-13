"use strict";

const debug = require("debug")("Bridge"),
  Node = require("./Node.js"),
  XYODATA = require("../../xyodata.js"),
  format = require("string-format");

class Bridge extends Node {

  constructor(moniker, host, ports, config) {
    debug("constructor");
    super(moniker, host, ports, config);
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
          sentinel.ports
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
          archivist.ports
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
          bridge.ports
        );
      }
    }
  }

  addSentinel(host, ports) {
    debug("addSentinel");
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.sentinels.push({ host: host, port: ports.pipe });
    }
  }

  addArchivist(host, ports) {
    debug("addArchivist");
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.archivists.push({ host: host, port: ports.pipe });
    }
  }

  onEntry(socket, entry) {
    debug(format("onEntry: {}"));
    let self = this;

    super.onEntry(entry);
    if (entry.p1signatures.length === 0) {
      debug("onEntry: P1");
      entry.p1Sign((payload) => {
        return self.sign(payload);
      }, () => {
        let buffer = entry.toBuffer();

        socket.write(buffer);
      });
    } else if (entry.p2signatures.length === 0) {
      debug("onEntry: P2");
      entry.p2Sign((payload) => {
        return self.sign(payload);
      },
      () => {
        let buffer = entry.toBuffer();

        socket.write(buffer);
      });
    } else {
      debug("onEntry: DONE");
      this.addEntryToLedger(entry);
    }
  }

  initiateArchivistSend(maxEntries) {
    debug("initiateArchivistSend");
    let archivist = Math.floor(Math.random() * 10);

    if (archivist < this.archivists.length) {
      let buffer, entry = new XYODATA.Entry(XYODATA.BinOn);

      for (let i = 0; i < maxEntries && i < this.entries.length; i++) {
        entry.payloads.push(this.entries[i].toBuffer());
      }
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].public);
      }
      buffer = entry.toBuffer();
      this.out(this.archivists[archivist], buffer);
    }
  }

  initiateSentinelPull() {
    debug("initiateSentinelPull");
    let sentinel = Math.floor(Math.random() * 10);

    if (sentinel < this.sentinels.length) {
      let buffer, entry = new XYODATA.Entry(XYODATA.BinOn);

      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].public);
      }
      buffer = entry.toBuffer();
      this.out(this.sentinels[sentinel], buffer);
    }
  }

  update(config) {
    debug("update");
    super.update(config);
    if (this.sentinels.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
      this.findArchivists(config.archivists);
    }
    this.initiateArchivistSend(8);
    this.initiateSentinelPull(2);
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
