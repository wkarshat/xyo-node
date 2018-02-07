"use strict";

const JSON5 = require("json5"),
  format = require("string-format"),
  bigInt = require("big-integer"),
  FS = require("fs");

Buffer.prototype.writeInt256 = () => {

};

Buffer.prototype.writeUInt256 = () => {

};

class BinOn {

  constructor(defaultObjectName) {
    this.defaultObjectName = defaultObjectName;
    this.maps = {};
    this.mapsByType = {};
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

  bufferToObj(buffer, offset, map, target) {
    let obj = target || {},
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
    let bi, parts, buf, buffers = [],
      activeMap = this.maps[this.defaultObjectName];

    if (map) {
      parts = map.split("*");
      activeMap = this.maps[parts[0]];
    }

    if (!activeMap) {
      throw new Error(format("Usage: Map Not Found [{}]", map));
    }

    console.log("ActiveMap: " + activeMap.name);

    if (activeMap.extends) {
      buffers.push(this.objToBuffer(obj, activeMap.extends));
    }

    for (let i = 0; i < activeMap.fields.length; i++) {
      console.log("Field: " + activeMap.fields[i].name);
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
          } else if (bi.greater(bigInt("FF", 32))) {
            bi = bigInt("FF", 32);
          }
          buf = Buffer.alloc(32);
          buf.writeUInt256(bi);
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
          if (bi.lesser("0")) {
            bi = 0;
          } else if (bi.greater(bigInt("FF", 32))) {
            bi = bigInt("FF", 32);
          }
          buf = Buffer.alloc(32);
          buf.writeInt256(bi);
          buffers.push(buf);
          break;
        default: // these are custom types
          parts = activeMap.fields[i].type.split("*");
          if (parts.length > 1) {
            console.log("array");
            buf = Buffer.alloc(2);
            buf.writeUInt16BE(obj[activeMap.fields[i].name].length);
            for (let j = 0; j < obj[activeMap.fields[i].name].length; j++) {
              buffers.push(this.objToBuffer(obj[activeMap.fields[i].name][j], parts[0]));
            }
          } else {
            console.log("single: " + activeMap.fields[i].name);
            buffers.push(this.objToBuffer(obj[activeMap.fields[i].name], activeMap.fields[i].type));
          }

          break;
      }
    }
    console.log(typeof buffers);
    return this.bufferConcat(buffers);
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
                  this.mapsByType[obj.type] = obj;
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
