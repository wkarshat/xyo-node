"use strict";
let debug = require("debug")("server"),
  XYO = require("./xyo.js"),
  CONFIG = require("config"),
  TESTDATACLASSES = require("./testdataclasses.js");

/* ================= */
/*  Local Functions  */
/* ================= */

const initialize = (complete) => {
    debug("Initializing...");
    if (CONFIG.sentinels && CONFIG.sentinels.length > 0) {
      CONFIG.sentinels.forEach((sentinel) => {
        if (sentinel.action === "launch") {
          XYO.fromPort[sentinel.port] = XYO.fromPort[sentinel.port] || new XYO.Sentinel(sentinel.domain, sentinel.port, sentinel.config || {});
        }
      });
    }

    if (CONFIG.bridges && CONFIG.bridges.length > 0) {
      CONFIG.bridges.forEach((bridge) => {
        if (bridge.action === "launch") {
          XYO.fromPort[bridge.port] = XYO.fromPort[bridge.port] || new XYO.Bridge(bridge.domain, bridge.port, bridge.config || {});
        }
      });
    }

    if (CONFIG.archivists && CONFIG.archivists.length > 0) {
      CONFIG.archivists.forEach((archivist) => {
        if (archivist.action === "launch") {
          XYO.fromPort[archivist.port] = XYO.fromPort[archivist.port] || new XYO.Archivist(archivist.domain, archivist.port, archivist.config || {});
          XYO.fromPort[archivist.port].findPeers(CONFIG.archivists);
        }
      });
    }

    if (CONFIG.diviners && CONFIG.diviners.length > 0) {
      CONFIG.diviners.forEach((diviner) => {
        if (diviner.action === "launch") {
          XYO.fromPort[diviner.port] = XYO.fromPort[diviner.port] || new XYO.Diviner(diviner.domain, diviner.port, diviner.config || {});
          XYO.fromPort[diviner.port].findPeers(CONFIG.diviners);
          XYO.fromPort[diviner.port].findArchivists(CONFIG.archivists);
        }
      });
    }

    if (complete) {
      complete();
    }

  },
  updateObjects = () => {
    debug(">>>>>>>>TIMER<<<<<<<<<");
    let key;

    XYO.Base.updateCount++;

    for (key in XYO.fromPort) {
      debug(key);
      if (XYO.fromPort.hasOwnProperty(key)) {
        XYO.fromPort[key].update(CONFIG);
      }
    }
  },
  startTimers = () => {
    setInterval(() => {
      updateObjects();

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
  // debug('block added: ' + JSON.stringify(newBlock));
  res.send();
}); */

initialize(() => {
  TESTDATACLASSES.All(() => {
    updateObjects();
    startTimers();
  });
});
