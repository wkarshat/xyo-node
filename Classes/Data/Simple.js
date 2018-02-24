/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: Simple.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, February 20, 2018 9:20 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const Base = require("../Base.js");

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
