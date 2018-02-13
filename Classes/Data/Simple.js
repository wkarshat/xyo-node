"use strict";

const debug = require("debug")("Simple"),
  Base = require("../Base.js");

/* Types */
/* =============
0x1001 = Simple
0x1002 = Distance
0x1003 = Id
0x1004 = Signature
0x1005 = Address
================ */

class Simple extends Base {

  constructor(binOn) {
    debug("constructor");
    super();
    this.type = 0x1001;
    this.map = "simple";
    this.binOn = binOn;
  }

  toBuffer() {
    return this.binOn.objToBuffer(this, null, true);
  }
}

module.exports = Simple;
