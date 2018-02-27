/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Location.js
 * @Last modified by:   arietrouw
 * @Last modified time: Monday, February 26, 2018 7:10 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Location'),
  Simple = require('./Simple.js'),
  bigInt = require('big-integer');

class Location extends Simple {

  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1004;
    this.map = 'location';
    this.latitude = bigInt('32757696800000000000'); // 18 places
    this.longitude = bigInt('-117149095600000000000'); // 18 places
    this.altitude = bigInt('15000000000000000000'); // 18 places (meters)
  }

}

module.exports = Location;
