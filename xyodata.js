"use strict";
const XYODATA = {};

XYODATA.Simple = require("./Classes/Data/Simple.js");
XYODATA.Complex = require("./Classes/Data/Complex.js");
XYODATA.Entry = require("./Classes/Data/Entry.js");
XYODATA.Ledger = require("./Classes/Data/Ledger.js");

XYODATA.classMap = {
  "simple": XYODATA.Simple,
  "complex": XYODATA.Complex,
  "entry": XYODATA.Entry,
  "ledger": XYODATA.Ledger
};

module.exports = XYODATA;
