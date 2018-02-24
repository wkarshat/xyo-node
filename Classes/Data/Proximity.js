/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Proximity.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, February 20, 2018 9:59 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Entry'),
  Simple = require('./Simple.js'),
  bigInt = require('big-integer');

class Proximity extends Simple {

  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1002;
    this.map = 'proximity';
    this.version = 1;
    this.range = bigInt(1000000000000000000); // 18 places (meters)
  }

}

module.exports = Proximity;
