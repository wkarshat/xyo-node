/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Proximity.js
 * @Last modified by:   arietrouw
 * @Last modified time: Monday, February 26, 2018 7:02 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Proximity'),
  Simple = require('./Simple.js'),
  bigInt = require('big-integer');

class Proximity extends Simple {

  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1002;
    this.map = 'proximity';
    this.range = bigInt(1000000000000000000); // 18 places (meters)
  }

}

module.exports = Proximity;
