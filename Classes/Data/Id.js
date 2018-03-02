/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Id.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 12:45 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Id'),
  Simple = require('./Simple.js'),
  CryptoByteBuffer = require("./CryptoByteBuffer.js"),
  bigInt = require('big-integer');

class Id extends Simple {

  constructor(buffer) {
    debug('constructor');
    super(buffer);
    this.type = 0x1003;
    this.id = bigInt('0');
  }

  toBuffer() {
    let buffer = super.toBuffer();

    buffer.writeUInt256(this.id);
    return buffer;
  }

  fromBuffer(buffer) {
    let byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    this.id = buffer.writeUInt256();
    return this;
  }

}

Simple.classMap[0x1003] = Id;

module.exports = Id;
