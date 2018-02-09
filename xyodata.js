"use strict";
const debug = require("debug")("xyodata"),
  BINON = require("./binon.js"),
  XYODATA = {};

XYODATA.Simple = require("./Classes/Data/Simple.js");
XYODATA.Complex = require("./Classes/Data/Complex.js");
XYODATA.Entry = require("./Classes/Data/Entry.js");
XYODATA.Ledger = require("./Classes/Data/Ledger.js");

XYODATA.BinOn = BINON.create({
  "simple": XYODATA.Simple,
  "complex": XYODATA.Complex,
  "entry": XYODATA.Entry,
  "ledger": XYODATA.Ledger
}, "simple");

debug("Loaded");

module.exports = XYODATA;
