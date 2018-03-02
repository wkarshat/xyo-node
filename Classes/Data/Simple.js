/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: Simple.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 8:23 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const Base = require('../Base.js'),
  debug = require('debug')('Simple'),
  CryptoByteBuffer = require('./CryptoByteBuffer.js');

/* Types */
/* =============
0x1001 = Simple
0x1002 = Proximity
0x1003 = Id
0x1004 = Location
0x1005 = Entry
0x1006 = Simple

================ */

class Simple extends Base {

  constructor(buffer) {
    super();
    this.type = 0x1001;
    if (buffer) {
      this.fromBuffer(buffer);
    }
  }

  toBuffer() {
    let buffer = new CryptoByteBuffer(16, false);

    buffer.writeUInt16(this.type);
    return buffer;
  }

  static registerClass(typeId, constructFunc) {
    if (Simple.classMap[typeId]) {
      throw new Error('Duplicate Class Id');
    }
    Simple.classMap[typeId] = constructFunc;
  }

  static fromBuffer(buffer) {
    let type, byteBuffer;

    byteBuffer = CryptoByteBuffer.wrap(buffer);
    byteBuffer.clear();

    type = byteBuffer.readUInt16();

    if (!Simple.classMap[type]) {
      throw new Error(`Unknown Class: ${type}`);
    }

    return new Simple.classMap[type](byteBuffer);
  }

  fromBuffer(buffer) {
    let byteBuffer = CryptoByteBuffer.wrap(buffer);

    byteBuffer.clear();
    this.type = byteBuffer.readUInt16();
    return this;
  }
}

Simple.classMap = {};
Simple.classMap[0x1001] = Simple;

module.exports = Simple;
