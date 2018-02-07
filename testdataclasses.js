"use strict";
const TestDataClasses = {},
  XYODATA = require("./xyodata.js"),
  format = require("string-format");

TestDataClasses.All = (complete) => {
  console.log("***********************************");
  console.log("*      Testing Data Classes       *");
  console.log("***********************************");

  let simple = new XYODATA.Simple(),
    complex = new XYODATA.Complex(),
    entry = new XYODATA.Entry(),
    ledger = new XYODATA.Ledger();

  console.log("* ===== Testing 'simple' ===== *");
  simple.toBuffer((buffer) => {
    console.log(format("0x{}", buffer.toString("hex")));
    console.log("* ===== Testing 'complex' ===== *");
    complex.toBuffer((buffer2) => {
      console.log(format("0x{}", buffer2.toString("hex")));
      console.log("* ===== Testing 'entry' ===== *");
      entry.toBuffer((buffer3) => {
        console.log(format("0x{}", buffer3.toString("hex")));
        console.log("* ===== Testing 'ledger' ===== *");
        ledger.toBuffer((buffer4) => {
          console.log(format("0x{}", buffer4.toString("hex")));

          if (complete) {
            complete();
          }
        });
      });
    });
  });
};

module.exports = TestDataClasses;
