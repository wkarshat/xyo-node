"use strict";
const XYO = {};

XYO.Base = function() {

};

XYO.Archivist = function() {
  this.entries = [];
  this.entriesById = {};
};

XYO.Archivist.prototype = new XYO.Base();
XYO.Archivist.constructor = XYO.Archivist;

module.exports = XYO;
