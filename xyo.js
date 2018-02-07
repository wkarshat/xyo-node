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
