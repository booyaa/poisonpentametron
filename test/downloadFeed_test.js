'use strict';

var pp = require('../lib/poisonpentametron.js');

exports['downloadFeed'] = {
  'download ok': function(test) {
    pp.downloadFeed('http://localhost/~booyaa/pentametron.rss', function(e, b) {
      test.expect(2);
      test.equal(e, undefined, 'error should be undefined');
      test.ok((b.length > 0), 'body should be populated');
      test.done();
    });
  },
  'test 404': function(test) {
    //fixme: refactor to allow 500, 401, 403s
    pp.downloadFeed('http://localhost/~booyaa/404.rss', function(e) {
      test.expect(1);
      test.equal(e.message, 'Server returned: 404', 'error should be 404');
      test.done();
    });
  },
  'test empty body': function (test) {
    pp.downloadFeed('http://localhost/~booyaa/empty.rss', function(e) {
      test.expect(1);
      test.equal(e.message, 'Feed was empty!', 'Error should be empty feed');
      test.done();
    });
  },
  'test no net connection fake domain': function (test) {
    pp.downloadFeed('http://nodomain.booyaa.org', function(e) {
      test.expect(1);
      test.equal(e.message, 'No internets!', 'Error should be no net connection');
      test.done();
    });
  }
};

