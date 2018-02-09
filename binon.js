"use strict";

const debug = require("debug")("BinOn"),
  JSON5 = require("json5"),
  format = require("string-format"),
  bigInt = require("big-integer"),
  crc32 = require("buffer-crc32"),
  FS = require("fs"),
  BINON = {};

class BinOn {

  constructor(classMap, defaultObjectName) {
    if (typeof classMap != "object") {
      throw new Error(format("BinOn requires a class map for construction[{}]", typeof classMap));
    }
    this.maps = {};
    this.mapsByType = {};
    this.classMap = classMap;
    this.defaultObjectName = defaultObjectName;
  }

  readInt256BE(buffer, offset) {
    return bigInt(buffer.toString("hex", offset, offset + 32), 16);
  }

  readUInt256BE(buffer, offset) {
    return bigInt(buffer.toString("hex", offset, offset + 32), 16);
  }

  bufferConcat(list, length) {

    let buffer, pos, len = length;

    if (!Array.isArray(list)) {
      throw new Error("Usage: bufferConcat(list, [length])");
    }

    if (list.length === 0) {
      return new Buffer(0);
    } else if (list.length === 1) {
      return list[0];
    }

    if (typeof len !== "number") {
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
    let obj = this.bufferToObj(buffer, offset);

    return JSON.stringify(obj);
  }

  bufferToJson5(buffer, offset) {
    let obj = this.bufferToObj(buffer, offset);

    return JSON5.stringify(obj);
  }

  getTypeFromBuffer(buffer) {
    return buffer.readUInt16BE(0);
  }

  getMapFromBuffer(buffer) {
    return this.mapsByType[this.getTypeFromBuffer(buffer)].name;
  }

  bufferToObj(buffer, offset, target, map) {
    let parts, length, activeMap = this.maps[map || this.getMapFromBuffer(buffer)],
      obj = target || new this.classMap[activeMap.name](),
      currentOffset = offset || 0;

    if (activeMap.extends) {
      currentOffset += this.bufferToObj(buffer, offset, obj, activeMap.extends).offset;
    }

    for (let i = 0; i < activeMap.fields.length; i++) {
      switch (activeMap.fields[i].type) {
        case "uint8":
          obj[activeMap.fields[i].name] = buffer.readUInt8(currentOffset);
          currentOffset += 1;
          break;
        case "uint16":
          obj[activeMap.fields[i].name] = buffer.readUInt16BE(currentOffset);
          currentOffset += 2;
          break;
        case "uint32":
          obj[activeMap.fields[i].name] = buffer.readUInt32BE(currentOffset);
          currentOffset += 4;
          break;
        case "uint256":
          obj[activeMap.fields[i].name] = this.readUInt256BE(buffer, currentOffset);
          currentOffset += 32;
          break;
        case "int8":
          obj[activeMap.fields[i].name] = buffer.readInt8(currentOffset);
          currentOffset += 1;
          break;
        case "int16":
          obj[activeMap.fields[i].name] = buffer.readInt16BE(currentOffset);
          currentOffset += 2;
          break;
        case "int32":
          obj[activeMap.fields[i].name] = buffer.readInt32BE(currentOffset);
          currentOffset += 4;
          break;
        case "int256":
          obj[activeMap.fields[i].name] = this.readInt256BE(buffer, currentOffset);
          currentOffset += 32;
          break;
        default: // these are custom types
          parts = activeMap.fields[i].type.split("*");
          if (parts.length > 1) {
            length = buffer.readUInt16BE(currentOffset);
            debug(format("array: [{}, {}]", activeMap.fields[i].name, currentOffset));
            currentOffset += 2;
            obj[activeMap.fields[i].name] = [];
            for (let j = 0; j < length; j++) {
              let subResult = this.bufferToObj(buffer, currentOffset);

              obj[activeMap.fields[i].name].push(subResult.obj);
              currentOffset = subResult.offset;
            }
          } else {
            debug(format("single: [{}, {}]", activeMap.fields[i].name, currentOffset));
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
    let obj = JSON.parse(json);

    return this.objToBuffer(obj);
  }

  json5ToBuffer(json5) {
    let obj = JSON.parse(json5);

    return this.objToBuffer(obj);
  }

  objToBuffer(obj, map, crc) {
    let bi, parts, buf, strBuf, buffers = [],
      activeMap = this.maps[obj.map];

    if (map) {
      parts = map.split("*");
      activeMap = this.maps[parts[0]];
    }

    if (!activeMap) {
      throw new Error(format("Usage: Map Not Found [{}]", map));
    }

    if (activeMap.extends) {
      buffers.push(this.objToBuffer(obj, activeMap.extends));
    }

    for (let i = 0; i < activeMap.fields.length; i++) {
      switch (activeMap.fields[i].type) {
        case "uint8":
          buf = Buffer.alloc(1);
          buf.writeUInt8(parseInt(obj[activeMap.fields[i].name]));
          buffers.push(buf);
          break;
        case "uint16":
          buf = Buffer.alloc(2);
          buf.writeUInt16BE(parseInt(obj[activeMap.fields[i].name]));
          buffers.push(buf);
          break;
        case "uint32":
          buf = Buffer.alloc(4);
          buf.writeUInt32BE(parseInt(obj[activeMap.fields[i].name]));
          buffers.push(buf);
          break;
        case "uint256":
          bi = bigInt(obj[activeMap.fields[i].name]);
          if (bi.lesser("0")) {
            bi = 0;
          } else if (bi.greater(bigInt("0x1").shiftLeft(256))) {
            bi = bigInt("0x1").shiftLeft(256).minus(1);
          }

          strBuf = bi.toString(16);
          while (strBuf.length < 64) {
            strBuf = format("0{}", strBuf);
          }

          buf = Buffer.from(strBuf, "hex", 32);
          buffers.push(buf);
          break;
        case "int8":
          buf = Buffer.alloc(1);
          buf.writeInt8(parseInt(obj[activeMap.fields[i].name]));
          buffers.push(buf);
          break;
        case "int16":
          buf = Buffer.alloc(2);
          buf.writeInt16(parseInt(obj[activeMap.fields[i].name]));
          buffers.push(buf);
          break;
        case "int32":
          buf = Buffer.alloc(4);
          buf.writeInt32(parseInt(obj[activeMap.fields[i].name]));
          buffers.push(buf);
          break;
        case "int256":
          bi = bigInt(obj[activeMap.fields[i].name]);
          if (bi.lesser(bigInt("0x1").shiftLeft(255).not())) {
            bi = bigInt("0x1").shiftLeft(255).not().plus(1);
          } else if (bi.greater(bigInt("0x1").shiftLeft(255))) {
            bi = bigInt("0x1").shiftLeft(255).minus(1);
          }
          strBuf = bi.toString(16);
          while (strBuf.length < 64) {
            strBuf = format("0{}", strBuf);
          }
          buf = Buffer.from(strBuf, "hex", 32);
          buffers.push(buf);
          break;
        default: // these are custom types
          parts = activeMap.fields[i].type.split("*");
          if (parts.length > 1) {
            buf = Buffer.alloc(2);
            buf.writeUInt16BE(obj[activeMap.fields[i].name].length);
            buffers.push(buf);
            for (let j = 0; j < obj[activeMap.fields[i].name].length; j++) {
              buffers.push(this.objToBuffer(obj[activeMap.fields[i].name][j], parts[0]));
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
    let folderToLoad = folder || "./BinOn";

    FS.readdir(folderToLoad, (error, filenames) => {
      if (error) {
        console.error(format("readdir: {}", error));
        complete();
      } else {
        debug(format("loadObjects.folder: {}", filenames.length));
        let fileCount = filenames.length;

        filenames.forEach((filename) => {
          let fullPath = format("{}/{}", folderToLoad, filename);

          FS.lstat(fullPath, (statsError, stats) => {
            if (statsError) {
              console.error(format("lstat: {}", statsError));
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
              FS.readFile(fullPath, "utf-8", (fileError, content) => {
                if (fileError) {
                  console.error(format("readFile: {}", fileError));
                } else {
                  let obj = JSON5.parse(content);

                  this.maps[obj.name] = obj;
                  this.mapsByType[obj.type] = obj;
                  debug(format("loadObjects.loaded: {}", obj.name));
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
