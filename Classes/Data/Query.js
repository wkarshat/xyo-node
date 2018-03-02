/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Monday, February 26, 2018 7:00 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Query.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 12:43 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Query'),
  Simple = require('./Simple.js'),
  CryptoByteBuffer = require("./CryptoByteBuffer.js");

class Query extends Simple {
  constructor(buffer) {
    debug('constructor');
    super(buffer);
    this.type = 0x1006;
    this.target = new CryptoByteBuffer();
    this.bounty = 0;
    this.epoch = 0;
    this.accuracy = 0;
    this.certainty = 0;
    this.delay = 0;
    this.etherGas = 0;
  }

  toBuffer() {
    let buffer = super.toBuffer();

    return buffer;
  }

  fromBuffer(buffer) {
    let byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    return this;
  }

}

Simple.classMap[0x1006] = Query;

module.exports = Query;
