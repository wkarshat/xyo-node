"use strict";

const JSON5 = require("json5"),
  format = require("string-format"),
  FS = require("fs");

class BinOn {

  constructor() {
    this.objects = {};
  }

  loadObjects(folder, complete) {
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
              this.loadObjects(fullPath, () => {
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

                  this.objects[obj.name] = obj;
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
