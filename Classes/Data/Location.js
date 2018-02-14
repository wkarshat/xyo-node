/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Location.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:25 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */



'use strict';

const debug = require('debug')('Entry'),
  Simple = require('./Simple.js'),
  bigInt = require('big-integer');

class Location extends Simple {

  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1004;
    this.map = 'location';
    this.version = 1;
    this.latitude = bigInt('327576968000000000'); // 16 places
    this.longitude = bigInt('-1171490956000000000'); // 16 places
    this.altitude = bigInt('150000000000000000'); // 16 places (meters)
  }

}

module.exports = Location;
