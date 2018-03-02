/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, March 2, 2018 1:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: CryptoByteBuffer.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 8:24 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const ByteBuffer = require('bytebuffer'),
  bigInt = require('big-integer');

class CryptoByteBuffer extends ByteBuffer {
  writeUInt256(value) {
    let strBuf, bi = value;

    if (bi.lesser('0')) {
      bi = 0;
    } else if (bi.greater(bigInt('0x1').shiftLeft(256))) {
      bi = bigInt('0x1').shiftLeft(256).minus(1);
    }

    strBuf = bi.toString(16);
    while (strBuf.length < 64) {
      strBuf = `0${strBuf}`;
    }

    this.append(Buffer.from(strBuf, 'hex', 32));
  }

  readUInt256() {
    
  }

  writeBufferArray(value) {

  }

  readBufferArray() {

  }
}

CryptoByteBuffer.wrap = (buffer, encoding, littleEndian, noAssert) => {
  let bb = ByteBuffer.wrap(buffer, encoding, littleEndian, noAssert),
    cbb = new CryptoByteBuffer(0, littleEndian, noAssert);

  cbb.buffer = bb.buffer;
  cbb.offset = 0;
  cbb.limit = bb.byteLength;

  return cbb;
}

module.exports = CryptoByteBuffer;
