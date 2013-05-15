'use strict';

var nconf = require('nconf')
  , config = nconf.file('./conf/pp.' + (process.env.NODE_ENV || 'development') + '.json').load()
  , _s = require('underscore.string');

function censorWord (word) {
  return word.substring(0,1) + _s.repeat("*", (word.length-1));
}

function censorTweet(tweet) {
  // console.log("tweet: %s tokens %d", tweet, tweet.split(" ").length);
  var tokenizedTweet = [];
  tweet.split(' ').forEach( function(word) {
    var newWord = "";

    if(config.blockList.indexOf(word) !== -1) {
      newWord = censorWord(word);
      // console.log("old: %s | new: %s", word, newWord);¬
    } else {
      newWord = word;
    }


    tokenizedTweet.push(newWord);
  });

  var newLine = tokenizedTweet.join(" ");

  return newLine;
}

module.exports.censorWord = censorWord;
module.exports.censorTweet = censorTweet;
