/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Sentinel.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 1, 2018 8:06 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Sentinel"),
  Node = require("./Node.js"),
  bigInt = require("big-integer"),
  XYODATA = require("../../xyodata.js");

class Sentinel extends Node {

  constructor(moniker, host, ports, config) {
    debug("constructor");

    process.title = "XYO-Sentinel";

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
      let id, buffer, entry = new XYODATA.Entry(XYODATA.BinOn);

      entry.p2keys = [];
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].exportKey('components-public').n);
      }

      id = new XYODATA.Id(XYODATA.BinOn);

      if (!id) {
        throw new Error("Missing Id");
      }

      entry.payload = Buffer.alloc(1);

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

      for (let i = 0; i < maxEntries && i < this.entries.length; i++) {
        let buf = this.entries[i].toBuffer();

        if (!buf) {
          throw new Error("Missing Payload");
        }

        entry.payload = buf;
      }
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].exportKey('components-public').n);
      }
      buffer = entry.toBuffer();
      this.out(this.bridges[bridge], buffer);
    }
  }

  onEntry(socket, entry) {
    debug('onEntry');
    super.onEntry(socket, entry);
  }

  in(socket) {
    debug('in');
    super.in(socket);
  }

  out(target, buffer) {
    debug('out');
    super.out(target, buffer);
  }

  update(config) {
    super.update(config);
    debug("update");
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
