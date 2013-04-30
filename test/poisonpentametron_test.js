'use strict';

var pp = require('../lib/poisonpentametron.js');

exports['helloWorld'] = {
  'true dat': function(test) {
    test.ok(pp.ok(), 'should be true');
    test.done();
  }
};
