'use strict';

var pp = require('../lib/createMatrix.js');

// cb(null, config.poetryBannerFile, poetry, 'utf-8');¬
exports['createMatrix'] = {
  setUp: function(done) {
    done();
  },
  'get 8 tweets': function(test) {
    // how would you test incorrect or missing config.feedFile?
    var poetryBannerFile = './views/poetry-banner.ejs';
    var cleanPoetry = [
          "i want a little monkey as a pet",
          "true life addicted to the internet",
          "manipulation  i already know",
          "id rather raise a player than a hoe",
          "i miss atlantis palm hotels dubai ",
          "i message everyone and no reply",
          "my stomach burning  gotta either  or ",
          "why mrcredit trending topic for?"
    ];

    pp.createMatrix(cleanPoetry, function(err, file, data, encoding) {
      test.equal(err, undefined, 'should be no errors');
      test.equal(file, poetryBannerFile);
      test.ok((data.length>0), 'should be greater than zero');
      test.equal(encoding, 'utf-8');
      test.done();
    });
  }
};

