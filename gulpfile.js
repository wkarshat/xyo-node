"use strict";

const gulp = require("gulp"),
  nodemon = require("gulp-nodemon");


gulp.task("default", [ "nodemon" ], () => {});

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
