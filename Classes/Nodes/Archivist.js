"use strict";

const debug = require("debug")("Archivist"),
  Node = require("./Node.js"),
  format = require("string-format");

class Archivist extends Node {

  constructor(moniker, domain, port, config) {
    debug("constructor");

    super(moniker, domain, port, config);
    this.entries = [];
    this.entriesByKey = {};

    this.io.on("connection", (socket) => {
      debug(format("New Connection"));
      socket.on("peers", (data) => {
        debug(format("onPeers[Archivist]:{}", data));
      });
      socket.emit("peers", format("peers[Archivist] [{}, {}]", moniker, port));
    });
  }

  get(req, res) {
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
  }

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

      this.addPeer(archivist.domain, archivist.port);
    }
  }

  status() {
    let status = super.status();

    status.type = "Archivist";
    status.entries = this.entries.length;

    return status;
  }
}

module.exports = Archivist;
