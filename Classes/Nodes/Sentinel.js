/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Sentinel.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 2:54 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Sentinel"),
  Node = require("./Node.js"),
  format = require('string-format'),
  XYODATA = require("../../xyodata.js");

class Sentinel extends Node {

  constructor(moniker, host, ports, config) {
    debug("constructor");

    super(moniker, host, ports, config);
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
        bridge.ports
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

  addBridge(host, ports) {
    debug("addBridge");
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.bridges.push({ host: host, port: ports.pipe });
    }
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

      entry.payloads.push(new XYODATA.Id(XYODATA.BinOn));

      buffer = entry.toBuffer();
      this.out(this.peers[peer], buffer);
    }
  }

  initiateBridgeSend(maxEntries) {
    debug("initiateBridgeSend");
    let bridge = Math.floor(Math.random() * 10);

    if (bridge < this.bridges.length) {
      let buffer, entry = new XYODATA.Entry(XYODATA.BinOn);

      entry.p2keys = [];
      entry.payloads = [];
      for (let i = 0; i < maxEntries && i < this.entries.length; i++) {
        entry.payloads.push(this.entries[i].toBuffer());
      }
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].public);
      }
      buffer = entry.toBuffer();
      this.out(this.bridges[bridge], buffer);
    }
  }

  update(config) {
    super.update(config);
    if (this.bridges.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
    }
    this.initiateBoundWitness();
    // this.initiateBridgeSend(2);
  }

  status() {
    let status = super.status();

    status.type = "Sentinel";
    status.bridges = this.bridges.length;
    return status;
  }
}

module.exports = Sentinel;
