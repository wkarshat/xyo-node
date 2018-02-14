/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:38 AM
 * @Email:  developer@xyfindables.com
 * @Filename: testdataclasses.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 2:01 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";
const debug = require("debug")("testsataclasses"),
  TestDataClasses = {},
  XYODATA = require("./xyodata.js"),
  XYO = require("./xyo.js");

TestDataClasses.All = () => {

  debug("***********************************");
  debug("*      Testing Data Classes       *");
  debug("***********************************");

  let simple = new XYODATA.Simple(XYODATA.BinOn),
    entry = new XYODATA.Entry(XYODATA.BinOn),
    node = new XYO.Node('test', 'localhost', {
      api: 8080,
      pipe: 8088
    }, {}),
    b0, b2,
    res0, res2;

  entry.p2keys = [];
  for (let i = 0; i < node.keys.length; i++) {
    entry.p2keys.push(node.keys[i].public);
  }

  entry.p1Sign((payload) => {
    return node.sign(payload);
  }, () => {});

  entry.p2Sign((payload) => {
    return node.sign(payload);
  }, () => {});

  debug("* ===== O2B Testing 'simple' ===== *");
  b0 = XYODATA.BinOn.objToBuffer(simple, null, true);
  debug(b0.toString("hex"));

  debug("* ===== O2B Testing 'entry' ===== *");
  b2 = XYODATA.BinOn.objToBuffer(entry, null, true);
  debug(b2.toString("hex"));

  debug("* ===== B2O Testing 'simple' ===== *");
  res0 = XYODATA.BinOn.bufferToObj(b0, 0);
  debug(JSON.stringify(res0.obj));

  debug("* ===== B2O Testing 'entry' ===== *");
  res2 = XYODATA.BinOn.bufferToObj(b2, 0);
  debug(JSON.stringify(res2.obj));

};

module.exports = TestDataClasses;
