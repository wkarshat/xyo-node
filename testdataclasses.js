/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:38 AM
 * @Email:  developer@xyfindables.com
 * @Filename: testdataclasses.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 1:26 AM
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

  let simple = new XYODATA.Simple(),
    entry = new XYODATA.Entry(),
    node = new XYO.Node('test', 'localhost', {
      api: 8080,
      pipe: 8088
    }, {}),
    b0, b2,
    res0, res2;

  entry.payload = (new XYODATA.Id()).toBuffer();

  entry.p2keys = [];
  for (let i = 0; i < node.keys.length; i++) {
    entry.p2keys.push(node.keys[i].exportKey('components-public').n);
  }

  entry.p1Sign((payload) => {
    return node.sign(payload);
  }, () => {});

  /* entry.p2Sign((payload) => {
    return node.sign(payload);
  }, () => {}); */

  debug("* ===== O2B Testing 'simple' ===== *");
  b0 = simple.toBuffer();
  debug(b0);

  debug("* ===== O2B Testing 'entry' ===== *");
  b2 = entry.toBuffer();
  debug(b2);

  debug("* ===== B2O Testing 'simple' ===== *");
  res0 = XYODATA.Simple.fromBuffer(b0);
  debug(JSON.stringify(res0.obj));

  debug("* ===== B2O Testing 'entry' ===== * ", b2.length);
  res2 = XYODATA.Simple.fromBuffer(b2);
  debug(JSON.stringify(res2.obj));

};

module.exports = TestDataClasses;
