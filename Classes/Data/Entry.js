/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:05 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Entry.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 2, 2018 1:15 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Entry"),
  Simple = require("./Simple.js"),
  CryptoByteBuffer = require("./CryptoByteBuffer.js"),
  bigInt = require("big-integer");

class Entry extends Simple {

  constructor(buffer) {
    // debug("constructor");
    super(buffer);
    this.type = 0x1005;
    this.payloads = [];
    this.nonce = bigInt.randBetween(bigInt("0x0"), bigInt("0x1").shiftLeft(255));
    this.difficulty = 0;
    this.epoch = 0;
    this.p1keys = [];
    this.p2keys = [];

    this.p1signatures = [];

    this.p2signatures = [];

    this.headKeys = [];
    this.tailKeys = [];

    this.headSignatures = [];
    this.tailSignatures = [];
  }

  p1Sign(signer, callback) {
    debug("p1Sign");
    let result, buffer = this.toBuffer();

    if (this.p2keys.length === 0) {
      throw new Error("Missing p2 Keys");
    }

    result = signer(buffer);
    this.p1keys = result.keys;
    this.p1signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }

  p2Sign(signer, callback) {
    debug("p2Sign");
    let result, buffer = this.toBuffer();

    if (this.p1keys.length === 0) {
      throw new Error("Missing p1 Keys - They are required for a p2Sign");
    }

    if (this.p1signatures.length === 0) {
      throw new Error("Missing p1 Signatures - They are required for a p2Sign");
    }

    if (this.p2keys.length === 0) {
      throw new Error("Missing p2 Keys - They are required for a p2Sign");
    }

    result = signer(buffer);

    this.p2signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }

  toBuffer() {
    let buffer = super.toBuffer();

    buffer.writeBufferArray(this.payloads);
    buffer.writeUInt32(this.epoch);
    buffer.writeUInt256(this.nonce);
    buffer.writeBufferArray(this.p1keys);
    buffer.writeBufferArray(this.p2keys);
    buffer.writeBufferArray(this.p2signatures);
    buffer.writeBufferArray(this.p1signatures);
    buffer.writeBufferArray(this.headKeys);
    buffer.writeBufferArray(this.tailKeys);
    buffer.writeBufferArray(this.headSignatures);
    buffer.writeBufferArray(this.tailSignatures);
    return buffer;
  }

  fromBuffer(buffer) {
    let byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);

    this.payloads = byteBuffer.readBufferArray();
    this.epoch = byteBuffer.readUInt32();
    this.nonce = byteBuffer.readUInt256();
    this.p1keys = byteBuffer.readBufferArray();
    this.p2keys = byteBuffer.readBufferArray();
    this.p2signatures = byteBuffer.readBufferArray();
    this.p1signatures = buffer.readBufferArray();
    this.headKeys = byteBuffer.readBufferArray();
    this.tailKeys = byteBuffer.readBufferArray();
    this.headSignatures = byteBuffer.readBufferArray();
    this.tailSignatures = byteBuffer.readBufferArray();

    return this;
  }
}

Simple.classMap[0x1005] = Entry;

module.exports = Entry;
