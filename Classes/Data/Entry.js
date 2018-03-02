/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:05 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Entry.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 1, 2018 8:06 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Entry"),
  Simple = require("./Simple.js"),
  bigInt = require("big-integer");

class Entry extends Simple {

  constructor(binOn) {
    // debug("constructor");
    super(binOn);
    this.type = 0x1005;
    this.map = "entry";
    this.payload = Buffer.alloc(1);
    this.nonce = bigInt.randBetween(bigInt("0x0"), bigInt("0x1").shiftLeft(255));
    this.difficulty = 0;
    this.p1keys = [];
    this.p2keys = [];

    this.p1signatures = [];

    this.p2signatures = [];

    this.headKeys = [];
    this.tailKeys = [];

    this.headSignatures = [];
    this.tailSignatures = [];
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
      throw new Error("Missing p1 Keys - They are required for a p2Sign");
    }

    if (this.p1signatures.length === 0) {
      throw new Error("Missing p1 Signatures - They are required for a p2Sign");
    }

    if (this.p2keys.length === 0) {
      throw new Error("Missing p2 Keys - They are required for a p2Sign");
    }

    result = signer(buffer);

    this.p2signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }
}

module.exports = Entry;
