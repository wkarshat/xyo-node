/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Archivist.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:26 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Archivist"),
  Node = require("./Node.js"),
  format = require("string-format");

class Archivist extends Node {

  constructor(moniker, host, ports, config) {
    debug("constructor");

    super(moniker, host, ports, config);
    this.entriesByKey = {};
  }

  /* get(req, res) {
    debug("get");
    let parts = req.path.split("/"),
      id = null;

    if (parts.length > 1) {
      id = parts[1];
    }

    if (id != null && id.length > 0) {
      let entries = this.entriesByKey[id];

      if (entries) {
        return res.send({
          "id": id,
          "entries": this.entriesByKey[id]
        });
      }
      return res.status(404).send(format("({}) Not Found", id));
    }

    return super.get(req, res);
  } */

  post(req, res) {
    debug("post");
    let action = req.body.action;

    switch (action) {
      case "add":
        if (req.body.entries) {
          this.addEntriesToDatabase(req.body.entries);
          res.status(201);
          return res.send({
            "entriesAdded": req.body.entries.length,
            "totalEntries": this.entries.length
          });
        } else if (req.body.payloads) {
          this.addPayloadsToDatabase(req.body.payloads);
          res.status(201);
          return res.send({
            "entriesAdded": req.body.payloads.length,
            "totalEntries": this.entries.length
          });
        }
        break;
      case "find":
        if (req.body.epoch) {
          let entries = this.find(req.body.keys, req.body.max, req.body.epoch);

          res.status(200);
          return res.send({
            "entriesFound": Object.keys(entries).length,
            "entries": entries
          });
        } else {
          let entries = this.find(req.body.keys, req.body.max);

          res.status(200);
          return res.send({
            "entriesFound": Object.keys(entries).length,
            "entries": entries
          });
        }
      default:
        break;
    }
    return super.post(req, res);
  }

  find(keys, max, epoch, entries) {
    debug("find");
    let entryList = entries || {};

    keys.forEach((key) => {
      let entry = this.entriesByKey[key];

      if (entry && !(key in entries)) {
        entryList[key] = entry;
        if (entry.pk1 === key) {
          entryList = this.find([entry.pk2], max, epoch, entryList);
        } else {
          entryList = this.find([entry.pk1], max, epoch, entryList);
        }
      }
    });

    return entryList;
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

  addEntriesToDatabase(entries) {
    debug("addEntriesToDatabase");
    entries.forEach((entry) => {
      let pk1Entries = this.entriesByKey[entry.pk1] || [],
        pk2Entries = this.entriesByKey[entry.pk2] || [];

      this.entriesByKey[entry.pk1] = pk1Entries;
      this.entriesByKey[entry.pk2] = pk2Entries;

      this.entries.push(entry);
      pk1Entries.push(entry);
      pk2Entries.push(entry);
    });
  }

  addPayloadsToDatabase(payloads) {
    debug("addPayloadsToDatabase");
    let entries = [];

    payloads.forEach((payload) => {
      entries.push(this.payload2Entry(payload));
    });

    this.addEntriesToDatabase(entries);
  }

  payload2Entry(payload) {
    return {
      "data": Buffer.from(payload).toString("base64")
    };
  }

  findPeers(archivists) {
    debug(format("findPeers: {}", JSON.stringify(this.config)));
    let key;

    for (key in archivists) {
      let archivist = archivists[key];

      this.addPeer(archivist.host, archivist.ports.pipe);
    }
  }

  status() {
    let status = super.status();

    status.type = "Archivist";

    return status;
  }
}

module.exports = Archivist;
