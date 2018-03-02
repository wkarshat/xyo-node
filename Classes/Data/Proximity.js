/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Proximity.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 12:49 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Proximity'),
  Simple = require('./Simple.js'),
  CryptoByteBuffer = require("./CryptoByteBuffer.js"),
  bigInt = require('big-integer');

class Proximity extends Simple {

  constructor(buffer) {
    debug('constructor');
    super(buffer);
    this.type = 0x1002;
    this.range = bigInt(10000000000000000); // 16 places (meters)
  }

  toBuffer() {
    let buffer = super.toBuffer();

    buffer.writeUInt256(this.range);
    return buffer;
  }

  fromBuffer(buffer) {
    let byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    this.range = byteBuffer.readUInt256();
    return this;
  }

}

Simple.classMap[0x1002] = Proximity;

module.exports = Proximity;
