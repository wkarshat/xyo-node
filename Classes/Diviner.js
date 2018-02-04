"use strict";

let Node = require("./Node.js"),
  HTTP = require("http"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Diviner extends Node {

  constructor(moniker, port, config) {
    console.log("Diviner - constructor");
    super(moniker, port, config);
    this.archivists = [];
  }

  query(question, callback) {
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
  }

  processBlocks(question, blocks, callback) {
    callback(null, {});
  }

  findBlocks(pk, epoch, callback) {
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
  }

  getBlock(pk, epoch, url, callback) {
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
  }

  findPeers(diviners) {
    console.log("Diviner - findPeers");
    diviners.forEach((diviner) => {
      this.addPeer(
        diviner.domain,
        diviner.port
      );
    });
  }

  findArchivists(archivists) {
    console.log("Diviner - findArchivists");
    archivists.forEach((archivist) => {
      this.addArchivist(
        archivist.domain,
        archivist.port
      );
    });
  }

  addArchivist(domain, port) {
    console.log("Diviner - addArchivist");
    let peer = IOCLIENT.connect("{}:{}", domain, port);

    peer.on("datarequests", (data) => {
      console.log(format("onDatarequests: {}"), data);
    });

    peer.emit("datarequests", format("datarequests: hello[{},{}]", domain, port));
    this.peers.push(peer);
  }

  status() {
    let status = super.status();

    status.archivists = this.archivists.length;
    return status;
  }
}

module.exports = Diviner;
