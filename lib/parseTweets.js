'use strict';

var nconf = require('nconf')
  , config = nconf.file('./conf/pp.' + (process.env.NODE_ENV || 'development') + '.json').load()
  , feedparser = require('feedparser');

function parseTweets(data, cb) {
  var feedFile = config.feed, rawPoetry = [];

  feedparser.parseFile(feedFile, function( err, meta, articles) {
    var i = 0;
    if (err) {
      cb(err);
    } else {
      articles.forEach(function(article) {
       if (i < 8) {
          var found = article.title.match(new RegExp(config.tweetRegExp, config.tweetRegExpOpt));
          rawPoetry.push(found[1]);
          i++;
        }
      });
      
      cb(null, config.rawFile, rawPoetry, 'utf-8'); // saveFile
    }
  });
}

module.exports.parseTweets = parseTweets;
