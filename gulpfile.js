/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Wednesday, January 24, 2018 8:44 AM
 * @Email:  developer@xyfindables.com
 * @Filename: gulpfile.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, February 27, 2018 11:24 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  env = require('gulp-env'),
  clear = require('clear');

gulp.args = () => {

  let argList = process.argv,
    arg = {},
    a, opt, thisOpt, curOpt;

  for (a = 0; a < argList.length; a++) {

    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {

      // argument value
      if (curOpt) {
        arg[curOpt] = opt;
      }
      curOpt = null;

    } else {

      // argument name
      curOpt = opt;
      arg[curOpt] = true;

    }

  }

  return arg;

};

gulp.task('default', () => {
  let args = gulp.args();

  if (args.run) {
    process.env.NODE_ENV = args.run;
  } else {
    process.env.NODE_ENV = 'default';
  }
  gulp.start('run');
});

gulp.task('run', ['nodemon'], () => {

});

gulp.task('inspect', () => {
  let args = gulp.args();

  if (args.run) {
    process.env.NODE_ENV = args.run;
  } else {
    process.env.NODE_ENV = 'default';
  }
  gulp.start('runInspect');
});

gulp.task('runInspect', ['nodemon-inspect'], () => {

});

gulp.task('nodemon-inspect', (cb) => {

  let started = false;

  env({
    vars: {
      DEBUG: '*,-socket.io*,-engine*,-express*,-snapdragon*,-body-parser*'
    }
  });

  return nodemon({
    'script': 'server.js',
    'nodeArgs': '--inspect-brk'
  }).on('start', () => {
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
      DEBUG: '*,-socket.io*,-engine*,-express*,-snapdragon*'
    }
  });

  return nodemon({
    'script': 'server.js'
  }).on('start', () => {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    clear();
    if (!started) {
      cb();
      started = true;
    }
  });
});
