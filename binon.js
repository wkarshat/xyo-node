'use strict';

const debug = require('debug')('BinOn'),
  JSON5 = require('json5'),
  format = require('string-format'),
  bigInt = require('big-integer'),
  crc32 = require('buffer-crc32'),
  FS = require('fs'),
  BINON = {};

class BinOn {

  constructor(classMap, defaultObjectName) {
    debug('constructor');
    if (typeof classMap != 'object') {
      throw new Error(format('BinOn requires a class map for construction[{}]', typeof classMap));
    }
    this.maps = {};
    this.mapsByType = {};
    this.classMap = classMap;
    this.defaultObjectName = defaultObjectName;
  }

  readInt256BE(buffer, offset) {
    // debug('readInt256BE');
    return bigInt(buffer.toString('hex', offset, offset + 32), 16);
  }

  readUInt256BE(buffer, offset) {
    // debug('readUInt256BE');
    return bigInt(buffer.toString('hex', offset, offset + 32), 16);
  }

  bufferConcat(list, length) {
    // debug('bufferConcat');
    let buffer, pos, len = length;

    if (!Array.isArray(list)) {
      throw new Error('Usage: bufferConcat(list, [length])');
    }

    if (list.length === 0) {
      return new Buffer(0);
    } else if (list.length === 1) {
      return list[0];
    }

    if (typeof len !== 'number') {
      len = 0;
      for (let i = 0; i < list.length; i++) {
        let buf = list[i];

        len += buf.length;
      }
    }

    buffer = Buffer.alloc(len);
    pos = 0;
    for (let i = 0; i < list.length; i++) {
      let buf = list[i];

      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer;
  }

  bufferToJson(buffer, offset) {
    // debug('bufferToJson');
    let obj = this.bufferToObj(buffer, offset);

    return JSON.stringify(obj);
  }

  bufferToJson5(buffer, offset) {
    // debug('bufferToJson5');
    let obj = this.bufferToObj(buffer, offset);

    return JSON5.stringify(obj);
  }

  getTypeFromBuffer(buffer) {
    // debug('getTypeFromBuffer');
    return buffer.readUInt16BE(0);
  }

  getMapFromBuffer(buffer) {
    // debug('getMapFromBuffer');
    let type = this.getTypeFromBuffer(buffer);

    if (type) {
      let map = this.mapsByType[type];

      if (map) {
        return this.mapsByType[type].name;
      }
    }
    return null;
  }

  bufferToObj(buffer, offset, target, map, isNative) {
    // debug('bufferToObj');
    let parts, length, activeMap, obj, currentOffset;

    activeMap = this.maps[map || this.getMapFromBuffer(buffer)];

    if (!activeMap) {
      if (isNative) {
        activeMap = {
          fields: [{
            index: 0,
            name: 'native',
            type: map
          }]
        };
      } else {
        return {
          obj: null,
          offset: currentOffset
        };
      }
    }

    obj = target || new this.classMap[activeMap.name](this);
    currentOffset = offset || 0;

    if (activeMap.extends) {
      currentOffset += this.bufferToObj(buffer, offset, obj, activeMap.extends).offset;
    }

    for (let i = 0; i < activeMap.fields.length; i++) {
      // debug(format('{}:{}', activeMap.fields[i].name, currentOffset));
      switch (activeMap.fields[i].type) {
        case 'uint8':
          if (isNative) {
            obj = buffer.readUInt8(currentOffset);
          } else {
            obj[activeMap.fields[i].name] = buffer.readUInt8(currentOffset);
          }
          currentOffset += 1;
          break;
        case 'uint16':
          if (isNative) {
            obj = buffer.readUInt16BE(currentOffset);
          } else {
            obj[activeMap.fields[i].name] = buffer.readUInt16BE(currentOffset);
          }
          currentOffset += 2;
          break;
        case 'uint32':
          if (isNative) {
            obj = buffer.readUInt32BE(currentOffset);
          } else {
            obj[activeMap.fields[i].name] = buffer.readUInt32BE(currentOffset);
          }
          currentOffset += 4;
          break;
        case 'uint256':
          if (isNative) {
            obj = this.readUInt256BE(buffer, currentOffset);
          } else {
            obj[activeMap.fields[i].name] = this.readUInt256BE(buffer, currentOffset);
          }
          currentOffset += 32;
          break;
        case 'int8':
          if (isNative) {
            obj = buffer.readInt8(currentOffset);
          } else {
            obj[activeMap.fields[i].name] = buffer.readInt8(currentOffset);
          }
          currentOffset += 1;
          break;
        case 'int16':
          if (isNative) {
            obj = buffer.readInt16BE(currentOffset);
          } else {
            obj[activeMap.fields[i].name] = buffer.readInt16BE(currentOffset);
          }
          currentOffset += 2;
          break;
        case 'int32':
          if (isNative) {
            obj = buffer.readInt32BE(currentOffset);
          } else {
            obj[activeMap.fields[i].name] = buffer.readInt32BE(currentOffset);
          }
          currentOffset += 4;
          break;
        case 'int256':
          if (isNative) {
            obj = this.readInt256BE(buffer, currentOffset);
          } else {
            obj[activeMap.fields[i].name] = this.readInt256BE(buffer, currentOffset);
          }
          currentOffset += 32;
          break;
        case 'buffer':
          length = buffer.readUInt16BE(currentOffset);
          currentOffset += 2;
          if (isNative) {
            obj = buffer.slice(currentOffset, currentOffset + length);
          } else {
            obj[activeMap.fields[i].name] = buffer.slice(currentOffset, currentOffset + length);
          }
          currentOffset += length;
          break;
        case 'signature':
          if (isNative) {
            obj = buffer.slice(currentOffset, currentOffset + 128);
          } else {
            obj[activeMap.fields[i].name] = buffer.slice(currentOffset, currentOffset + 128);
          }
          if (obj.length !== 128) {
            throw new Error('Failed to read 128 bytes for signature');
          }
          currentOffset += 128;
          break;
        case 'address':
          if (isNative) {
            obj = buffer.slice(currentOffset, currentOffset + 220).toString();
          } else {
            obj[activeMap.fields[i].name] = buffer.slice(currentOffset, currentOffset + 220).toString();
          }
          if (obj.length !== 220) {
            throw new Error('Failed to read 220 bytes for address');
          }
          currentOffset += 220;
          break;
        default: // these are custom types
          parts = activeMap.fields[i].type.split('*');
          if (parts.length > 1) {
            length = buffer.readUInt16BE(currentOffset);
            // debug(format('array: [{}, {}]', activeMap.fields[i].name, currentOffset));
            currentOffset += 2;
            obj[activeMap.fields[i].name] = [];
            for (let j = 0; j < length; j++) {
              let subResult = this.bufferToObj(buffer, currentOffset, {}, parts[0], true);

              obj[activeMap.fields[i].name].push(subResult.obj);
              currentOffset = subResult.offset;
            }
          } else {
            // debug(format('single: [{}, {}]', activeMap.fields[i].name, currentOffset));
            let subResult = this.bufferToObj(buffer, currentOffset);

            obj[activeMap.fields[i].name] = subResult.obj;
            currentOffset = subResult.offset;
          }
          break;
      }
    }

    return {
      offset: currentOffset,
      obj: obj
    };
  }

  jsonToBuffer(json) {
    // debug('jsonToBuffer');
    let obj = JSON.parse(json);

    return this.objToBuffer(obj);
  }

  json5ToBuffer(json5) {
    // debug('json5ToBuffer');
    let obj = JSON.parse(json5);

    return this.objToBuffer(obj);
  }

  objToBuffer(obj, map, crc, isNative) {
    // debug('objToBuffer');
    let bi, parts, buf, strBuf, buffers = [],
      activeMap = this.maps[obj.map];

    if (map) {
      parts = map.split('*');
      activeMap = this.maps[parts[0]];
    }

    if (!activeMap) {
      if (isNative) {
        activeMap = {
          fields: [{
            index: 0,
            name: 'native',
            type: map
          }]
        };
      } else {
        throw new Error(format('Usage: Map Not Found [{}]', map));
      }
    }

    if (activeMap.extends) {
      buffers.push(this.objToBuffer(obj, activeMap.extends));
    }

    for (let i = 0; i < activeMap.fields.length; i++) {
      // debug(format('{}:{}', activeMap.fields[i].name, Buffer.concat(buffers).length));
      switch (activeMap.fields[i].type) {
        case 'uint8':
          buf = Buffer.alloc(1);
          if (isNative) {
            buf.writeUInt8(parseInt(obj));
          } else {
            buf.writeUInt8(parseInt(obj[activeMap.fields[i].name]));
          }
          buffers.push(buf);
          break;
        case 'uint16':
          buf = Buffer.alloc(2);
          if (isNative) {
            buf.writeUInt16BE(parseInt(obj));
          } else {
            buf.writeUInt16BE(parseInt(obj[activeMap.fields[i].name]));
          }
          buffers.push(buf);
          break;
        case 'uint32':
          buf = Buffer.alloc(4);
          if (isNative) {
            buf.writeUInt32BE(parseInt(obj));
          } else {
            buf.writeUInt32BE(parseInt(obj[activeMap.fields[i].name]));
          }
          buffers.push(buf);
          break;
        case 'uint256':
          if (isNative) {
            bi = bigInt(obj);
          } else {
            bi = bigInt(obj[activeMap.fields[i].name]);
          }

          if (bi.lesser('0')) {
            bi = 0;
          } else if (bi.greater(bigInt('0x1').shiftLeft(256))) {
            bi = bigInt('0x1').shiftLeft(256).minus(1);
          }

          strBuf = bi.toString(16);
          while (strBuf.length < 64) {
            strBuf = format('0{}', strBuf);
          }

          buf = Buffer.from(strBuf, 'hex', 32);
          buffers.push(buf);
          break;
        case 'int8':
          buf = Buffer.alloc(1);
          if (isNative) {
            buf.writeInt8(parseInt(obj));
          } else {
            buf.writeInt8(parseInt(obj[activeMap.fields[i].name]));
          }
          buffers.push(buf);
          break;
        case 'int16':
          buf = Buffer.alloc(2);
          if (isNative) {
            buf.writeInt16(parseInt(obj));
          } else {
            buf.writeInt16(parseInt(obj[activeMap.fields[i].name]));
          }
          buffers.push(buf);
          break;
        case 'int32':
          buf = Buffer.alloc(4);
          if (isNative) {
            buf.writeInt32(parseInt(obj));
          } else {
            buf.writeInt32(parseInt(obj[activeMap.fields[i].name]));
          }
          buffers.push(buf);
          break;
        case 'int256':
          if (isNative) {
            bi = bigInt(obj);
          } else {
            bi = bigInt(obj[activeMap.fields[i].name]);
          }

          if (bi.lesser(bigInt('0x1').shiftLeft(255).not())) {
            bi = bigInt('0x1').shiftLeft(255).not().plus(1);
          } else if (bi.greater(bigInt('0x1').shiftLeft(255))) {
            bi = bigInt('0x1').shiftLeft(255).minus(1);
          }
          strBuf = bi.toString(16);
          while (strBuf.length < 64) {
            strBuf = format('0{}', strBuf);
          }
          buf = Buffer.from(strBuf, 'hex', 32);
          buffers.push(buf);
          break;
        case 'buffer':
          buf = Buffer.alloc(2);
          if (isNative) {
            buf.writeUInt16BE(obj.length);
            buffers.push(buf);
            buf = obj;
          } else {
            buf.writeUInt16BE(obj[activeMap.fields[i].name].length);
            buffers.push(buf);
            buf = obj[activeMap.fields[i].name];
          }
          buffers.push(buf);
          break;
        case 'signature':
          if (isNative) {
            if (obj.length !== 128) {
              throw new Error(format('Signatures must be 128 Bytes [{}]', obj));
            }
            buf = obj;
          } else {
            if (obj[activeMap.fields[i].name].length !== 128) {
              throw new Error(format('Signatures must be 128 Bytes [{}]', obj));
            }
            buf = obj[activeMap.fields[i].name];
          }
          buffers.push(buf);
          break;
        case 'address':
          buf = Buffer.alloc(220);
          if (isNative) {
            if (obj.length !== 220) {
              throw new Error(format('Signatures must be 220 Bytes [{}]', obj));
            }
            buf.write(obj);
          } else {
            if (obj[activeMap.fields[i].name].length !== 220) {
              throw new Error(format('Signatures must be 220 Bytes [{}]', obj));
            }
            buf.write(obj[activeMap.fields[i].name]);
          }
          buffers.push(buf);
          break;
        default: // these are custom types
          parts = activeMap.fields[i].type.split('*');
          if (parts.length > 1) {
            buf = Buffer.alloc(2);
            buf.writeUInt16BE(obj[activeMap.fields[i].name].length);
            buffers.push(buf);
            for (let j = 0; j < obj[activeMap.fields[i].name].length; j++) {
              buffers.push(this.objToBuffer(obj[activeMap.fields[i].name][j], parts[0], false, true));
            }
          } else {
            buffers.push(this.objToBuffer(obj[activeMap.fields[i].name], activeMap.fields[i].type));
          }

          break;
      }
    }
    if (crc) {
      buf = Buffer.alloc(4);
      buf.writeUInt32BE(crc32.unsigned(this.bufferConcat(buffers)));
      buffers.push(buf);
    }
    return this.bufferConcat(buffers);
  }

  loadMaps(folder, complete) {
    // debug('loadMaps');
    let folderToLoad = folder || './BinOn';

    FS.readdir(folderToLoad, (error, filenames) => {
      if (error) {
        console.error(format('readdir: {}', error));
        complete();
      } else {
        // debug(format('loadObjects.folder: {}', filenames.length));
        let fileCount = filenames.length;

        filenames.forEach((filename) => {
          let fullPath = format('{}/{}', folderToLoad, filename);

          FS.lstat(fullPath, (statsError, stats) => {
            if (statsError) {
              console.error(format('lstat: {}', statsError));
              fileCount--;
              if (fileCount === 0) {
                complete();
              }
            } else if (stats.isDirectory()) {
              this.loadMaps(fullPath, () => {
                fileCount--;
                if (fileCount === 0) {
                  complete();
                }
              });
            } else {
              FS.readFile(fullPath, 'utf-8', (fileError, content) => {
                if (fileError) {
                  console.error(format('readFile: {}', fileError));
                } else {
                  let obj = JSON5.parse(content);

                  this.maps[obj.name] = obj;
                  this.mapsByType[obj.type] = obj;
                  // debug(format('loadObjects.loaded: {}', obj.name));
                }
                fileCount--;
                if (fileCount === 0) {
                  complete();
                }
              });
            }
          });
        });
      }
    });
  }
}

BINON.create = function(classMap, defaultObjectName) {
  return new BinOn(classMap, defaultObjectName);
};

module.exports = BINON;
