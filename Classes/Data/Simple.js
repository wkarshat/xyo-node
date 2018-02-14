/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: Simple.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:25 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Simple"),
  Base = require("../Base.js");

/* Types */
/* =============
0x1001 = Simple
0x1002 = Proximity
0x1003 = Id
0x1004 = Location
0x1005 = Entry

================ */

class Simple extends Base {

  constructor(binOn) {
    debug("constructor");
    super();
    this.type = 0x1001;
    this.version = 1;
    this.map = "simple";
    this.binOn = binOn;
  }

  toBuffer() {
    return this.binOn.objToBuffer(this, null, true);
  }
}

module.exports = Simple;
