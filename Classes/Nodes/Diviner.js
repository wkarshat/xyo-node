"use strict";

const debug = require("debug")("Diviner"),
  Node = require("./Node.js"),
  HTTP = require("http"),
  IOCLIENT = require("socket.io-client"),
  format = require("string-format");

class Diviner extends Node {

  constructor(moniker, host, port, config) {
    debug("constructor");
    super(moniker, host, port, config);
    this.archivists = [];
  }

  query(question, callback) {
    debug("query");
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
    debug("processBlocks");
    callback(null, {});
  }

  findBlocks(pk, epoch, callback) {
    debug("findBlocks");
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
    debug("getBlock");
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
    debug("findPeers");
    let key;

    for (key in diviners) {
      let diviner = diviners[key];

      if (!(diviner.ports.pipe === this.ports.pipe && diviner.host === this.host)) {
        this.addPeer(
          diviner.host,
          diviner.ports.pipe
        );
      }
    }
  }

  findArchivists(archivists) {
    debug("findArchivists");
    let key;

    for (key in archivists) {
      let archivist = archivists[key];

      if (!(archivist.ports.pipe === this.ports.pipe && archivist.host === this.host)) {
        this.addArchivist(
          archivist.host,
          archivist.ports.pipe
        );
      }
    }
  }

  addArchivist(host, port) {
    debug("addArchivist");
    let archivist = IOCLIENT.connect("{}:{}", host, port);

    archivist.on("datarequests", (data) => {
      debug(format("onDatarequests: {}"), data);
    });

    archivist.emit("datarequests", format("datarequests: hello[{},{}]", host, port));
    this.archivists.push(archivist);
  }

  update(config) {
    debug("update");
    super.update(config);
    if (this.archivists.length === 0) {
      this.findArchivists(config.archivists);
      this.findPeers(config.diviners);
    }
  }

  status() {
    let status = super.status();

    status.type = "Diviner";
    status.archivists = this.archivists.length;
    return status;
  }
}

module.exports = Diviner;
