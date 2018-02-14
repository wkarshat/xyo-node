/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:45 AM
 * @Email:  developer@xyfindables.com
 * @Filename: xyodata.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:27 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";
const debug = require("debug")("xyodata"),
  BINON = require("./binon.js"),
  XYODATA = {};

debug("loading...");

XYODATA.Simple = require("./Classes/Data/Simple.js");
XYODATA.Entry = require("./Classes/Data/Entry.js");
XYODATA.Id = require("./Classes/Data/Id.js");
XYODATA.Proximity = require("./Classes/Data/Proximity.js");
XYODATA.Location = require("./Classes/Data/Location.js");

XYODATA.BinOn = BINON.create({
  "simple": XYODATA.Simple,
  "complex": XYODATA.Complex,
  "entry": XYODATA.Entry,
  "ledger": XYODATA.Ledger
}, "simple");

module.exports = XYODATA;
