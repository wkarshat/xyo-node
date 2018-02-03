"use strict";
let XYO = require("./xyo.js"),
  TIMERS = require("timers"),
  CONFIG = require("config");

/* ================= */
/*  Local Functions  */
/* ================= */

const initialize = () => {
  if (CONFIG.sentinels && CONFIG.sentinels.length > 0) {
    CONFIG.sentinels.forEach((sentinel) => {
      XYO.fromPort[sentinel.port] = XYO.fromPort[sentinel.port] || new XYO.Sentinel(String(sentinel.port), sentinel.port, sentinel.config || {});
    });
  }

  if (CONFIG.bridges && CONFIG.bridges.length > 0) {
    CONFIG.bridges.forEach((bridge) => {
      XYO.fromPort[bridge.port] = XYO.fromPort[bridge.port] || new XYO.Bridge(String(bridge.port), bridge.port, bridge.config || {});
    });
  }

  if (CONFIG.archivists && CONFIG.archivists.length > 0) {
    CONFIG.archivists.forEach((archivist) => {
      XYO.fromPort[archivist.port] = XYO.fromPort[archivist.port] || new XYO.Archivist(String(archivist.port), archivist.port, archivist.config || {});
    });
  }

  if (CONFIG.diviners && CONFIG.diviners.length > 0) {
    CONFIG.diviners.forEach((diviner) => {
      XYO.fromPort[diviner.port] = XYO.fromPort[diviner.port] || new XYO.Diviner(String(diviner.port), diviner.port, diviner.config || {});
    });
  }

  TIMERS.setInterval(() => {
    let key;
    
    XYO.Base.updateCount++;

    for (key in XYO.fromMoniker) {
      if (XYO.fromMoniker.hasOwnProperty(key)) {
        XYO.fromMoniker[key].update();
      }
    }

  }, CONFIG.clock);

};

/* ============= */
/*  Application  */
/* ============= */

/* app.get("/blocks", (req, res) => res.send(JSON.stringify(BLOCKCHAIN.blockchain)));

app.post("/mineBlock", (req, res) => {
  let newBlock = BLOCKCHAIN.generateNextBlock(req.body.data);

  BLOCKCHAIN.addBlock(newBlock);
  // broadcast(responseLatestMsg());
  // console.log('block added: ' + JSON.stringify(newBlock));
  res.send();
}); */

initialize();
