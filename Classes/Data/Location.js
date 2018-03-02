/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Location.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 12:44 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Location'),
  Simple = require('./Simple.js'),
  CryptoByteBuffer = require("./CryptoByteBuffer.js"),
  bigInt = require('big-integer');

class Location extends Simple {

  constructor(buffer) {
    debug('constructor');
    super(buffer);
    this.type = 0x1004;
    this.latitude = bigInt('32757696800000000000'); // 24 places
    this.longitude = bigInt('-117149095600000000000'); // 24 places
    this.altitude = bigInt('15000000000000000000'); // 16 places (meters)
  }

  toBuffer() {
    let buffer = super.toBuffer();

    buffer.writeInt256(this.latitude);
    buffer.writeInt256(this.longitude);
    buffer.writeInt256(this.altitude);
    return buffer;
  }

  fromBuffer(buffer) {
    let byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    this.latitude = buffer.readInt256();
    this.longitude = buffer.readInt256();
    this.altitude = buffer.readInt256();
    return this;
  }

}

Simple.classMap[0x1004] = Location;

module.exports = Location;
