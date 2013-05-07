'use strict';

var pp = require('../lib/poisonpentametron.js');

exports['censorship'] = {
  setUp: function(done) {
    done();
  },

  'test one word': function(test) {
    test.equal(pp.censorWord('x1booyaa1x'), 'x*********', 'should censor word');
    test.done();
  },

  'censor tweet': function(test) {
    test.equal(pp.censorTweets('this is a test tweet x1booyaa1x woot!'), 'this is a test tweet x********* woot!', 'should censor tweet');
    test.done();
  },

  'censor tweet2': function(test) { // fixme: lame test needs to be a dictionary test praps?
    test.equal(pp.censorTweets('this is a test tweet fucked woot!'), 'this is a test tweet ' + pp.censorWord('fucked') + ' woot!', 'should censor tweet');
    test.done();
  }
};

