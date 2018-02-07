"use strict";

let Complex = require("./Complex.js"),
  bigInt = require("big-integer");

class Ledger extends Complex {

  constructor() {
    super();
    this.type = 0x2004;
    this.map = "ledger";
    this.version = 1;
    this.entries = [];
  }
}

module.exports = Ledger;
