/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Wednesday, January 24, 2018 10:35 AM
 * @Email:  developer@xyfindables.com
 * @Filename: xyo.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:27 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";
const XYO = {};

XYO.Base = require("./Classes/Base.js");
XYO.Node = require("./Classes/Nodes/Node.js");
XYO.Sentinel = require("./Classes/Nodes/Sentinel.js");
XYO.Bridge = require("./Classes/Nodes/Bridge.js");
XYO.Archivist = require("./Classes/Nodes/Archivist.js");
XYO.Diviner = require("./Classes/Nodes/Diviner.js");

XYO.fromMoniker = XYO.Node.fromMoniker;
XYO.fromPort = XYO.Node.fromPort;

module.exports = XYO;
