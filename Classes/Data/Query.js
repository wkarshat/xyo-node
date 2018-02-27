/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Monday, February 26, 2018 7:00 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Query.js
 * @Last modified by:   arietrouw
 * @Last modified time: Monday, February 26, 2018 7:04 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Query'),
  Simple = require('./Simple.js'),
  bigInt = require('big-integer');

class Query extends Simple {
  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1006;
    this.map = 'query';
    this.target = null;
    this.bounty = 0;
    this.epoch = 0;
    this.accuracy = 0;
    this.certainty = 0;
    this.delay = 0;
    this.etherGas = 0;
  }

}

module.exports = Query;
