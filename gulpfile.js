"use strict";

const gulp = require("gulp"),
  browserSync = require("browser-sync"),
  nodemon = require("gulp-nodemon");


gulp.task("default", [ "browser-sync" ], () => {});

gulp.task("browser-sync", [ "nodemon" ], () => {
  browserSync.init(null, {
    "proxy": "http://localhost:3456",
    "files": [ "public/**/*.*" ],
    "browser": "google chrome",
    "port": 7000
  });
});
gulp.task("nodemon", (cb) => {

  let started = false;

  return nodemon({
    "script": "server.js"
  }).on("start", () => {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
});
