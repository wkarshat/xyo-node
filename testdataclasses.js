"use strict";
const TestDataClasses = {},
  XYODATA = require("./xyodata.js"),
  BinOn = require("./binon.js"),
  format = require("string-format"),
  binon = new BinOn(XYODATA.classMap, "simple");

TestDataClasses.All = () => {

  console.log("***********************************");
  console.log("*      Testing Data Classes       *");
  console.log("***********************************");

  binon.loadMaps(null, () => {

    let simple = new XYODATA.Simple(binon),
      complex = new XYODATA.Complex(binon),
      entry = new XYODATA.Entry(binon),
      ledger = new XYODATA.Ledger(binon),
      b0, b1, b2, b3,
      res0, res1, res2, res3;

    console.log("* ===== O2B Testing 'simple' ===== *");
    b0 = binon.objToBuffer(simple, null, true);
    console.log(b0.toString("hex"));

    console.log("* ===== O2B Testing 'complex' ===== *");
    b1 = binon.objToBuffer(complex, null, true);
    console.log(b1.toString("hex"));

    console.log("* ===== O2B Testing 'entry' ===== *");
    b2 = binon.objToBuffer(entry, null, true);
    console.log(b2.toString("hex"));

    console.log("* ===== O2B Testing 'ledger' ===== *");
    b3 = binon.objToBuffer(ledger, null, true);
    console.log(b3.toString("hex"));

    console.log("* ===== B2O Testing 'simple' ===== *");
    res0 = binon.bufferToObj(b0, 0);
    console.log(JSON.stringify(res0.obj));

    console.log("* ===== B2O Testing 'complex' ===== *");
    res1 = binon.bufferToObj(b1, 0);
    console.log(JSON.stringify(res1.obj));

    console.log("* ===== B2O Testing 'entry' ===== *");
    res2 = binon.bufferToObj(b2, 0);
    console.log(JSON.stringify(res2.obj));

    console.log("* ===== B2O Testing 'ledger' ===== *");
    res3 = binon.bufferToObj(b3, 0);
    console.log(JSON.stringify(res3.obj));

  });
};

module.exports = TestDataClasses;
