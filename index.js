/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Saturday, July 18, 2015 11:24 PM
 * @Email:  developer@xyfindables.com
 * @Filename: index.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 1, 2018 5:31 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';
let debug = require('debug')('xyo-node'),
  XYO = require('./xyo.js'),
  CONFIG = require('config'),
  TESTDATACLASSES = require('./testdataclasses.js'),
  XYODATA = require('./xyodata.js');

/* ================= */
/*  Local Functions  */
/* ================= */

const initialize = (complete) => {
    debug('Initializing...');
    let key;

    if (CONFIG.sentinels) {
      for (key in CONFIG.sentinels) {
        let sentinel = CONFIG.sentinels[key];

        debug(`Sentinel Action: ${sentinel.action}`);
        if (sentinel.action === 'launch') {
          XYO.fromPort[sentinel.ports.pipe] = XYO.fromPort[sentinel.ports.pipe] || new XYO.Sentinel(`sentinel-${key}`, sentinel.host, sentinel.ports, sentinel.config || {});
        }
      }
    }

    if (CONFIG.bridges) {
      for (key in CONFIG.bridges) {
        let bridge = CONFIG.bridges[key];

        debug(`Bridge Action: ${bridge.action}`);
        if (bridge.action === 'launch') {
          XYO.fromPort[bridge.ports.pipe] = XYO.fromPort[bridge.ports.pipe] || new XYO.Bridge(`bridge-${key}`, bridge.host, bridge.ports, bridge.config || {});
        }
      }
    }

    if (CONFIG.archivists) {
      for (key in CONFIG.archivists) {
        let archivist = CONFIG.archivists[key];

        debug(`Archivist Action: ${archivist.action}`);

        if (archivist.action === 'launch') {
          XYO.fromPort[archivist.ports.pipe] = XYO.fromPort[archivist.ports.pipe] || new XYO.Archivist(`acrhivist-${key}`, archivist.host, archivist.ports, archivist.config || {});
          XYO.fromPort[archivist.ports.pipe].findPeers(CONFIG.archivists);
        }
      }
    }

    if (CONFIG.diviners) {
      for (key in CONFIG.diviners) {
        let diviner = CONFIG.diviners[key];

        debug(`Diviner Action: ${diviner.action}`);

        if (diviner.action === 'launch') {
          XYO.fromPort[diviner.ports.pipe] = XYO.fromPort[diviner.ports.pipe] || new XYO.Diviner(`diviner-${key}`, diviner.host, diviner.ports, diviner.config || {});
          XYO.fromPort[diviner.ports.pipe].findPeers(CONFIG.diviners);
          XYO.fromPort[diviner.ports.pipe].findArchivists(CONFIG.archivists);
        }
      }
    }

    if (complete) {
      complete();
    }

  },
  updateObjects = () => {
    debug(`>>>>>>>>TIMER<<<<<<<<< [${Object.keys(XYO.fromMoniker).length}]`);
    let key;

    XYO.Base.updateCount++;

    for (key in XYO.fromMoniker) {
      if (XYO.fromMoniker.hasOwnProperty(key)) {
        XYO.fromMoniker[key].update(CONFIG);
      }
    }
  },
  startTimers = () => {
    setInterval(() => {
      updateObjects();

    }, CONFIG.clock);
  },
  run = () => {
    updateObjects();
    startTimers();
  };


initialize(() => {
  XYODATA.BinOn.loadMaps(null, () => {
    if (CONFIG.testdataclasses) {
      TESTDATACLASSES.All();
    }
    run();
  });
});
