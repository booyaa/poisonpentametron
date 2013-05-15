'use strict';

var nconf = require('nconf')
  , config = nconf.file('./conf/pp.' + (process.env.NODE_ENV || 'development') + '.json').load();

var censorTweet = require('./censorship.js').censorTweet;

function cleanText(rawPoetry, cb) {
  // remove RT and @'s
  // remove any characters not supported
  // censors text
  var cleanPoetry = [];

  rawPoetry.forEach(function(line) {
    var lowerCased = line.toLowerCase();
    var stripChars = lowerCased.replace(new RegExp(config.stripCharsRegExp, config.stripCharsRegExpOpt), '');
    
    var censoredTweet = censorTweet(stripChars); // FIXME: coupled

    cleanPoetry.push(censoredTweet);
  });

  return cb(null, config.cleanFile, cleanPoetry, 'utf-8');
}

module.exports.cleanText = cleanText;
