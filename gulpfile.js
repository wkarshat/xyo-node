/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Wednesday, January 24, 2018 8:44 AM
 * @Email:  developer@xyfindables.com
 * @Filename: gulpfile.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, February 15, 2018 11:21 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const gulp = require("gulp"),
  nodemon = require("gulp-nodemon"),
  env = require("gulp-env"),
  clear = require('clear');

gulp.task("default", ["nodemon"], () => {

});

gulp.task("inspect", ["nodemon-inspect"], () => {

});

gulp.task('nodemon-inspect', (cb) => {

  let started = false;

  env({
    vars: {
      DEBUG: "*,-socket.io*,-engine*,-express*,-snapdragon*,-body-parser*"
    }
  });

  return nodemon({
    "script": "server.js",
    "nodeArgs": "--inspect"
  }).on("start", () => {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    clear();
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('nodemon', (cb) => {

  let started = false;

  env({
    vars: {
      DEBUG: "*,-socket.io*,-engine*,-express*,-snapdragon*"
    }
  });

  return nodemon({
    "script": "server.js"
  }).on("start", () => {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    clear();
    if (!started) {
      cb();
      started = true;
    }
  });
});
