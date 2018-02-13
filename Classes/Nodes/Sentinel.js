"use strict";

const debug = require("debug")("Sentinel"),
  Node = require("./Node.js"),
  format = require('string-format'),
  XYODATA = require("../../xyodata.js");

class Sentinel extends Node {

  constructor(moniker, host, port, config) {
    debug("constructor");

    super(moniker, host, port, config);
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
          sentinel.ports
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

  addBridge(host, port) {
    debug("addBridge");
    this.bridges.push({ host: host, port: port });
  }

  initiateBoundWitness() {
    debug("initiateBoundWitness");
    let peer = Math.floor(Math.random() * 10);

    if (peer < this.peers.length) {
      let buffer, entry = new XYODATA.Entry(XYODATA.BinOn);

      entry.p2keys = [];
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].public);
      }
      buffer = entry.toBuffer();
      this.out(this.peers[peer], buffer);
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
