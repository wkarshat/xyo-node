"use strict";

const debug = require("debug")("Complex"),
  Simple = require("./Simple.js");

/* Types */
/* =============
0x2001 = Complex
0x2002 = Chain
0x2003 = Entry
0x2004 = Ledger
================ */

class Complex extends Simple {

  constructor() {
    debug("constructor");
    super();
    this.type = 0x2001;
    this.version = 1;
    this.map = "complex";
  }
}

module.exports = Complex;
