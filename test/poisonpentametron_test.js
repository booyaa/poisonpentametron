'use strict';

var pp = require('../lib/poisonpentametron.js');

exports['updateFeed'] = {
  setUp: function(done) {
    done();
  },
  'no args': function(test) {
    pp.updateFeed(function(err) {
        test.equal(err, undefined, 'should return no errors');
        test.done();
    });
  }
};
