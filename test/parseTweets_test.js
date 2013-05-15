'use strict';

var pp = require('../lib/parseTweets.js');


exports['parseTweets'] = {
  setUp: function(done) {
    this.feedFile = './test/pentametron.rss';
    done();
  },
  'get 8 tweets': function(test) {
    // how would you test incorrect or missing config.feedFile?
    pp.parseTweets('ignored', function(err, rawFile, rawPoetry, encoding) {
      test.equal(err, undefined, 'should be no errors');
      test.equal(rawFile, './stage/rawfile.json');
      test.equal(rawPoetry.length, 8);
      test.equal(encoding, 'utf-8');
      test.done();
    });
  }
};

