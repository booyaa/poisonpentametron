'use strict';

var pp = require('../lib/sanitiseTweets.js');

exports['cleanText'] = {
  setUp: function(done) {
    this.feedFile = './test/pentametron.rss';
    this.rawPoetry = ['I want a 123little monkey as a pet.', 'one'];
    this.cleanPoetry = ['i want a little monkey as a pet','one'];
    done();
  },
  'cleanText': function(test) {
    var cleanPoetry = this.cleanPoetry;
    pp.cleanText(this.rawPoetry, function(err, file, data, encoding) {
      test.equal(err, undefined, 'should be no errors');
      test.equal(file, './stage/cleanFile.json');
      test.deepEqual(data, cleanPoetry);
      test.equal(encoding, 'utf-8');
      test.done();
    });
  }
};

