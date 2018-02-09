"use strict";

const Base = require("../Base.js"),
  XYODATA = require("../../xyodata.js");

/* Types */
/* =============
0x1001 = Simple
0x1002 = Distance
0x1003 = Id
0x1004 = Signature
0x1005 = Address
================ */

class Simple extends Base {

  constructor() {
    super();
    this.type = 0x1001;
    this.map = "simple";
  }

  toBuffer() {
    debug(JSON.stringify(XYODATA));
    return XYODATA.BinOn.objToBuffer(this, null, true);
  }
}

module.exports = Simple;
