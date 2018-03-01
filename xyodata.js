/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:45 AM
 * @Email:  developer@xyfindables.com
 * @Filename: xyodata.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 1, 2018 3:00 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";
const BINON = require("./binon.js"),
  XYODATA = {};

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
