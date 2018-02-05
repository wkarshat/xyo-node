"use strict";

const JSON5 = require("json5"),
  format = require("string-format"),
  bigInt = require("big-integer"),
  FS = require("fs");

class BinOn {

  constructor(defaultObjectName) {
    this.defaultObjectName = defaultObjectName;
    this.maps = {};
    this.mapsByType = {};
  }

  bufferToJson(buffer, offset) {
    let obj = this.bufferToObj(buffer, offset);

    return JSON.stringify(obj);
  }

  bufferToJson5(buffer, offset) {
    let obj = this.bufferToObj(buffer, offset);

    return JSON5.stringify(obj);
  }

  bufferToObj(buffer, offset, map) {
    let obj = {},
      activeMap = map || this.maps[this.defaultObjectName],
      currentOffset = offset || 0;

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
        default: // these are custom types
          obj[activeMap.fields[i].name] = this.bufferToObj(buffer, currentOffset, this.maps[activeMap.fields[i].type]);
          break;
      }
    }

    return obj;
  }

  jsonToBuffer(json) {
    let obj = JSON.parse(json);

    return this.objToBuffer(obj);
  }

  json5ToBuffer(json5) {
    let obj = JSON.parse(json5);

    return this.objToBuffer(obj);
  }

  objToBuffer(obj, map) {
    let bi, buffers = [],
      activeMap = map || this.maps[this.defaultObjectName];

    for (let i = 0; i < activeMap.fields.length; i++) {
      switch (activeMap.fields[i].type) {
        case "uint8":
          buffers.push(new Buffer(1).writeUInt8(parseInt(obj[activeMap.fields[i].name])), 0);
          break;
        case "uint16":
          buffers.push(new Buffer(2).writeUInt16(parseInt(obj[activeMap.fields[i].name])), 0);
          break;
        case "uint32":
          buffers.push(new Buffer(4).writeUInt32(parseInt(obj[activeMap.fields[i].name])), 0);
          break;
        case "uint256":
          bi = bigInt(obj[activeMap.fields[i].name]);
          if (bi.lesser("0")) {
            bi = 0;
          } else if (bi.greater(bigInt("FF", 32))) {
            bi = bigInt("FF", 32);
          }
          buffers.push(new Buffer(32).writeUInt256(bi), 0);
          break;
        case "int8":
          buffers.push(new Buffer(1).writeInt8(parseInt(obj[activeMap.fields[i].name])), 0);
          break;
        case "int16":
          buffers.push(new Buffer(2).writeInt16(parseInt(obj[activeMap.fields[i].name])), 0);
          break;
        case "int32":
          buffers.push(new Buffer(4).writeInt32(parseInt(obj[activeMap.fields[i].name])), 0);
          break;
        case "int256":
          bi = bigInt(obj[activeMap.fields[i].name]);
          if (bi.lesser("0")) {
            bi = 0;
          } else if (bi.greater(bigInt("FF", 32))) {
            bi = bigInt("FF", 32);
          }
          buffers.push(new Buffer(32).writeInt256(bi), 0);
          break;
        default: // these are custom types
          buffers.push(this.objToBuffer(activeMap.fields[i].name, activeMap.fields[i].type));
          break;
      }
    }

    return obj;
  }

  loadMaps(folder, complete) {
    let folderToLoad = folder || "./BinOn";

    FS.readdir(folderToLoad, (error, filenames) => {
      if (error) {
        console.error(format("readdir: {}", error));
        complete();
      } else {
        console.log(format("loadObjects.folder: {}", filenames.length));
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
                  console.log(format("loadObjects.loaded: {}", obj.name));
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

module.exports = BinOn;
