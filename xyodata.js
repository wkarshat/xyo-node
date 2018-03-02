/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:45 AM
 * @Email:  developer@xyfindables.com
 * @Filename: xyodata.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 12:50 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";
const XYODATA = {};

XYODATA.Simple = require("./Classes/Data/Simple.js");
XYODATA.Entry = require("./Classes/Data/Entry.js");
XYODATA.Id = require("./Classes/Data/Id.js");
XYODATA.Proximity = require("./Classes/Data/Proximity.js");
XYODATA.Location = require("./Classes/Data/Location.js");

module.exports = XYODATA;
