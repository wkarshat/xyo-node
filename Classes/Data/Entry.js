/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:05 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Entry.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 6:12 PM
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
    this.version = 1;
    this.payloads = [];
    this.nonce = bigInt.randBetween(bigInt("0x0"), bigInt("0x1").shiftLeft(255));
    this.difficulty = 0;
    this.p1keys = [];
    this.p2keys = [];

    this.p1signatures = [];

    this.p2signatures = [];

    this.headkeys = [];
    this.tailkeys = [];
    
    this.headsignatures = [];
    this.tailsignatures = [];
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
