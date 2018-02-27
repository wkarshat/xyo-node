/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Id.js
 * @Last modified by:   arietrouw
 * @Last modified time: Monday, February 26, 2018 7:04 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Id'),
  Simple = require('./Simple.js');

class Id extends Simple {

  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1003;
    this.map = 'id';
    this.domain = "xy";
    this.value = "12345";
  }

}

module.exports = Id;
