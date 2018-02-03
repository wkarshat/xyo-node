"use strict";

let Node = require("./Node.js"),
  HTTP = require("http"),
  format = require("string-format");

class Diviner extends Node {

  constructor(moniker, port, config) {
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

  findPeers() {
    this.config.diviners.forEach((diviner) => {
      this.addPeer(diviner);
    });
  }

  findArchivists() {
    this.config.archivists.forEach((archivist) => {
      this.addArchivist(archivist);
    });
  }

  status() {
    let status = super.status();

    status.archivists = this.archivists.length;
    return status;
  }
}

module.exports = Diviner;
