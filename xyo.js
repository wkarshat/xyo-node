"use strict";
const HTTP = require("http"),
  format = require("string-format"),
  XYO = {};

XYO.KNOWN = {
  "archivists": [
    "archivist.cnn.com"
  ],
  "diviners": [
    "diviner.cnn.com"
  ]
};

XYO.ObjectMap = {};

XYO.Base = function(moniker) {
  this.peers = [];
  XYO.ObjectMap[moniker] = this;
};

XYO.Base.prototype.addPeer = function(url, callback) {
  HTTP.get(url, (resp) => {
    let data = "";

    resp.on("data", (chunk) => {
      data += chunk;
    });

    resp.on("end", () => {
      this.peer.push(data);
      callback(null, data);
    });

  }).on("error", (err) => {
    callback(err, null);
  });
};

XYO.Base.prototype.status = function() {
  return {
    "enabled": true,
    "peers": this.peers.length
  };
};

XYO.Archivist = function(moniker) {
  XYO.Base.prototype.constructor.call(this, moniker);
  this.entries = [];
  this.entriesById = {};
};

XYO.Archivist.prototype = new XYO.Base();
XYO.Archivist.constructor = XYO.Archivist;

XYO.Archivist.prototype.findPeers = function() {
  XYO.KNOWN.archivists.forEach((archivist) => {
    this.addPeer(archivist);
  });
};

XYO.Diviner = function(moniker) {
  XYO.Base.prototype.constructor.call(this, moniker);
  this.archivists = [];
};

XYO.Diviner.prototype = new XYO.Base();
XYO.Diviner.constructor = XYO.Diviner;

XYO.Diviner.prototype.query = function(question, callback) {
  this.findBlocks(question, (blocks) => {
    this.processBlocks(question, blocks, (answer) => {
      callback({
        "success": (answer.accuracy >= question.accuracy && answer.certainty >= question.certainty),
        "question": question,
        "answer": answer,
        "blocks": blocks
      });
    });
  });
};

XYO.Diviner.prototype.processBlocks = function(question, blocks, callback) {
  callback(null, {});
};

XYO.Diviner.prototype.findPeers = function() {
  XYO.KNOWN.diviners.forEach((diviner) => {
    this.addPeer(diviner);
  });
};

XYO.Diviner.prototype.findArchivists = function() {
  XYO.KNOWN.archivists.forEach((archivist) => {
    this.addArchivist(archivist);
  });
};

XYO.Diviner.prototype.findBlocks = function(pk, epoch, callback) {
  let count = this.archivist.length,
    blocks = [];

  this.archivists.forEach((archivist) => {
    this.getBlock(pk, epoch, archivist, (err, block) => {
      if (!err) {
        blocks.push(JSON.parse(block));
      }
      count--;
      if (count === 0) {
        callback(blocks);
      }
    });
  });
};

XYO.Diviner.prototype.getBlock = function(pk, epoch, url, callback) {
  HTTP.get(url + format("/?key={}&epoch={}", pk, epoch), (resp) => {
    let data = "";

    resp.on("data", (chunk) => {
      data += chunk;
    });

    resp.on("end", () => {
      callback(null, data);
    });

  }).on("error", (err) => {
    callback(err, null);
  });
};

XYO.Diviner.prototype.status = function() {
  let status = Object.getPrototypeOf(XYO.Diviner.prototype).status.call(this);

  status.archivists = this.archivists.length;
  return status;
};

module.exports = XYO;
