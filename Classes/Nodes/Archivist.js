/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Archivist.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 1, 2018 6:18 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Archivist'),
  Node = require('./Node.js');

class Archivist extends Node {

  constructor(moniker, host, ports, config) {
    debug('constructor');

    process.title = 'XYO-Archivist';

    super(moniker, host, ports, config);
    this.entriesByP1Key = {};
    this.entriesByP2Key = {};
    this.entriesByHeadKey = {};
    this.entriesByTailKey = {};
  }

  get(req, res) {
    debug('get');
    return super.get(req, res);
  }

  post(req, res) {
    debug('post');
    let action, entries;

    action = req.body.action;

    switch (action) {
      case 'find':
        entries = this.find(req.body);
        return res.status(200).send({ count: Object.keys(entries).length, entries: entries });
      default:
        break;
    }
    return super.post(req, res);
  }

  find(config, entries) {
    debug('find');
    let entryList = entries || {};

    config.keys.forEach((key) => {
      let entry = this.entriesByP1Key[key];

      if (entry && !(key in entryList)) {
        entryList[key] = entry;
        entryList = this.find({ epoch: config.epoch, max: config.max, keys: entry.p1keys.concat(entry.p2keys) }, entryList);
      }

      entry = this.entriesByP2Key[key];

      if (entry && !(key in entryList)) {
        entryList[key] = entry;
        entryList = this.find({ epoch: config.epoch, max: config.max, keys: entry.p1keys.concat(entry.p2keys) }, entryList);
      }

      entry = this.entriesByTailKey[key];

      if (entry && !(key in entryList)) {
        entryList[key] = entry;
        entryList = this.find({ epoch: config.epoch, max: config.max, keys: entry.p1keys.concat(entry.p2keys) }, entryList);
      }

      entry = this.entriesByHeadKey[key];

      if (entry && !(key in entryList)) {
        entryList[key] = entry;
        entryList = this.find({ epoch: config.epoch, max: config.max, keys: entry.p1keys.concat(entry.p2keys) }, entryList);
      }
    });

    return entryList;
  }

  findPeers(archivists) {
    debug('findPeers');
    let key;

    for (key in archivists) {
      let archivist = archivists[key];

      this.addPeer(archivist.host, archivist.ports.pipe);
    }
  }

  addEntryToLedger(entry) {
    debug('addEntryToLedger');

    if (entry.p1keys.length === 0) {
      throw new Error('Trying to add entry to ledger without P1 keys');
    }
    if (entry.p1signatures.length === 0) {
      throw new Error('Trying to add entry to ledger without P1 signatures');
    }
    if (entry.p2keys.length === 0) {
      throw new Error('Trying to add entry to ledger without P2 keys');
    }
    if (entry.p2signatures.length === 0) {
      throw new Error('Trying to add entry to ledger without P2 signatures');
    }

    super.addEntryToLedger(entry);
    entry.p1keys.forEach((key) => {
      this.entriesByP1Key[key] = entry;
    });
    entry.p2keys.forEach((key) => {
      this.entriesByP2Key[key] = entry;
    });
  }

  signHeadAndTail(entry) {
    debug('signHeadAndTail');

    super.signHeadAndTail(entry);

    if (entry.headKeys.length === 0) {
      throw new Error('Trying to index entry without Head keys');
    }
    if (entry.headSignatures.length === 0) {
      throw new Error('Trying to index entry without Head signatures');
    }
    if (entry.p2keys.length === 0) {
      throw new Error('Trying to index entry without Tail keys');
    }
    if (entry.p2signatures.length === 0) {
      throw new Error('Trying to index entry without Tail signatures');
    }

    entry.headKeys.forEach((key) => {
      this.entriesByHeadKey[key] = entry;
    });
    entry.tailKeys.forEach((key) => {
      this.entriesByTailKey[key] = entry;
    });
  }

  update(config) {
    debug("update");
    super.update(config);
  }

  onEntry(socket, entry) {
    debug('onEntry');
    super.onEntry(socket, entry);
  }

  in(socket) {
    debug('in');
    super.in(socket);
  }

  out(target, buffer) {
    debug('out');
    super.out(target, buffer);
  }

  status() {
    let status = super.status();

    status.type = 'Archivist';
    status.entriesByKey = Object.keys(this.entriesByKey).length;

    return status;
  }

}

module.exports = Archivist;
