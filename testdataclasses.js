"use strict";
const debug = require("debug")("testsataclasses"),
  TestDataClasses = {},
  XYODATA = require("./xyodata.js");

TestDataClasses.All = (complete) => {

  debug("***********************************");
  debug("*      Testing Data Classes       *");
  debug("***********************************");

  XYODATA.BinOn.loadMaps(null, () => {

    let simple = new XYODATA.Simple(),
      complex = new XYODATA.Complex(),
      entry = new XYODATA.Entry(),
      ledger = new XYODATA.Ledger(),
      b0, b1, b2, b3,
      res0, res1, res2, res3;

    debug("* ===== O2B Testing 'simple' ===== *");
    b0 = XYODATA.BinOn.objToBuffer(simple, null, true);
    debug(b0.toString("hex"));

    debug("* ===== O2B Testing 'complex' ===== *");
    b1 = XYODATA.BinOn.objToBuffer(complex, null, true);
    debug(b1.toString("hex"));

    debug("* ===== O2B Testing 'entry' ===== *");
    b2 = XYODATA.BinOn.objToBuffer(entry, null, true);
    debug(b2.toString("hex"));

    debug("* ===== O2B Testing 'ledger' ===== *");
    b3 = XYODATA.BinOn.objToBuffer(ledger, null, true);
    debug(b3.toString("hex"));

    debug("* ===== B2O Testing 'simple' ===== *");
    res0 = XYODATA.BinOn.bufferToObj(b0, 0);
    debug(JSON.stringify(res0.obj));

    debug("* ===== B2O Testing 'complex' ===== *");
    res1 = XYODATA.BinOn.bufferToObj(b1, 0);
    debug(JSON.stringify(res1.obj));

    debug("* ===== B2O Testing 'entry' ===== *");
    res2 = XYODATA.BinOn.bufferToObj(b2, 0);
    debug(JSON.stringify(res2.obj));

    debug("* ===== B2O Testing 'ledger' ===== *");
    res3 = XYODATA.BinOn.bufferToObj(b3, 0);
    debug(JSON.stringify(res3.obj));

    if (complete) {
      complete();
    }

  });
};

module.exports = TestDataClasses;
