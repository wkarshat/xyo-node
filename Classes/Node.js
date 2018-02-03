"use strict";

let Base = require("./Base"),
  HTTP = require("http"),
  express = require("express"),
  bodyParser = require("body-parser");

class Node extends Base {

  constructor(moniker, port, config) {
    super();
    this.moniker = moniker;
    this.port = port;
    this.peers = [];
    this.config = config;
    this.app = express();
    this.app.listen(port);
    this.app.use(bodyParser.json());
    Node.fromMoniker[moniker] = this;
    Node.fromPort[port] = this;
  }

  addPeer(url, callback) {
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
  }

  update() {

  }

  shutdown() {
    delete Base.fromMoniker[this.moniker];
    delete Base.fromPort[this.port];
  }

  status() {
    return {
      "enabled": true,
      "peers": this.peers.length
    };
  }

  returnJSONStatus(req, res) {
    let object = Base.fromPort[req.port];

    res.status(200).send(JSON.stringify(object.status()));
  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCopunt = 0;

module.exports = Node;
