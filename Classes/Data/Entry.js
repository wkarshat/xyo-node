"use strict";

const debug = require("debug")("Entry"),
  Complex = require("./Complex.js"),
  bigInt = require("big-integer");

class Entry extends Complex {

  constructor(binOn) {
    debug("constructor");
    super(binOn);
    this.type = 0x2003;
    this.map = "entry";
    this.version = 1;
    this.payloads = [];
    this.nonce = bigInt.randBetween(bigInt("0x0"), bigInt("0x1").shiftLeft(255));
    this.difficulty = 0;
    this.p1keys = [];
    this.p2keys = [];

    this.p1signatures = [];

    this.p2signatures = [];
  }

  p1Sign(signer, callback) {
    debug("p1Sign");
    let result, buffer = this.toBuffer();

    if (this.p2keys.length === 0) {
      throw new Error("Missing p2 Keys");
    }

    result = signer(buffer);
    this.p1keys = result.keys;
    this.p1signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }

  p2Sign(signer, callback) {
    debug("p2Sign");
    let result, buffer = this.toBuffer();

    if (this.p1keys.length === 0) {
      throw new Error("Missing p1 Keys");
    }

    if (this.p1signatures.length === 0) {
      throw new Error("Missing p1 Signatures");
    }

    if (this.p2keys.length === 0) {
      throw new Error("Missing p2 Keys");
    }

    result = signer(buffer);

    this.p2signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }
}

module.exports = Entry;
