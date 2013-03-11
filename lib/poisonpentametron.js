var fs = require('fs');

var config = require('../conf/pp.js');

var pp = {};

pp.poetry = "";
pp.poetryPlain = "";
pp.rawPoetry = [];
pp.cleanPoetry = [];

function createPlainText() {
  pp.cleanPoetry.forEach(function(line) {
    // console.log(line);
    pp.poetryPlain += "    " + line + "\n";
  });

  fs.writeFileSync(config.poetryPlainFile, pp.poetryPlain, 'utf-8');
}

function createMatrix() {
  // load text into array of lines
  // get maxWidth
  var maxWidth = 0;
  pp.cleanPoetry.forEach(function(line) {
    if (line.length > maxWidth) {
      maxWidth = line.length;
    }
  });

  console.log('largest line width: %d', maxWidth);

  var _s = require('underscore.string');

  // pad array to maxWidth
  var padded = pp.cleanPoetry.map(function(line) {
    return _s.rpad(line, maxWidth, ' ');
  });

  // transpose
  var matrix = [];
  padded.forEach(function(line) {
    matrix.push(line.split(''));
  });

  var array = require('array-extended')
    , transpose = array(matrix).transpose().value();

  // walk array and translate characters to images
  for(var x = 0; x < transpose.length; x++) {
    var row = transpose[x];

    for(var y = row.length-1; y >= 0; y--) {
      var char = row[y];
      if (char === " ") { char = "blank"; }
      if (char === "!") { char = "exclaim"; }
      if (char === "?") { char = "question"; }
      pp.poetry += "<img src=\"<%= absUrl('/images/" + char + ".gif') %>\" />\n";
    }

    pp.poetry += "<br />\n";
  }
  // write to view/poisonpentametron.ejs?
  fs.writeFileSync(config.poetryBannerFile, pp.poetry, 'utf-8'); 

  
  console.log('create matrix and write to poetry template file');
} // createMatrix

function cleanText() {
  // remove RT and @'s
  // remove any characters not supported
  pp.rawPoetry.forEach(function(line) {
    var lowerCased = line.toLowerCase();
    var stripChars = lowerCased.replace(config.stripCharsRegExp, '');
    // console.log('before: %s\nafter: %s ', lowerCased, stripChars);
    pp.cleanPoetry.push(stripChars);
  });

  fs.writeFileSync(config.cleanFile, JSON.stringify(pp.cleanPoetry, null, 4), 'utf-8'); 
  console.log('strip unwanted characters');
} // cleanText

function parseTweets(err, meta, articles) {
  console.log('parseTweets');
  var i = 0;
  if (err) {
    console.error(err);
  } else {
    articles.forEach(function(article) {
      if (i < 8) {
        var found = article.title.match(config.tweetRegExp);
        // console.log('%d %s', i, found[1]);
        pp.rawPoetry.push(found[1]);
        i++;
      }
    });
  }

  console.log('writing %d tweets to raw file', pp.rawPoetry.length);
  fs.writeFileSync(config.rawFile, JSON.stringify(pp.rawPoetry, null, 4), 'utf-8');
  cleanText();
  createMatrix();
  createPlainText();
} // parseTweets


pp.isFeedFresh = function() {
  // checks if conf.Feed is older than conf.maxAgeInHours
  require('date-utils');
  
  if (fs.existsSync(config.feed)) { // quick way to test caching
    console.log('checking how old feed is');
    var stats = fs.statSync(config.feed)
      , feed = new Date(stats.mtime)
      , now = new Date()
      , delta = feed.getHoursBetween(now);

    // console.log(JSON.stringify(stats, null, 4));
    console.log('feed: %s\nnow %s\ndelta %s', feed, now, delta);
    return delta < config.maxAgeInHours;
  } else {
    console.log('no feed found');
    return false;
  }
};

pp.updateFeed = function() {
  // reset
  pp.poetry = "";
  pp.poetryPlain = "";
  pp.rawPoetry = [];
  pp.cleanPoetry = [];

  // rename old feed (just in case)
  var feedparser = require('feedparser');

  console.log('renaming feed');
  var dayNumber = (new Date()).getDay();
  if (fs.existsSync(config.feed)) {
    console.log('apparently this dont work');
    // fs.renameSync(config.feed, config.feed + '.' + dayNumber);
  }

  console.log('caching twitter feed');
  var http = require('http');

  // get a new copy of feed
  //FIXME: replace this with request and streams
  var feed = "";

  http.get(config.url, function(res) {
    res.on('data', function(data) {
     feed += data.toString();
    });
   res.on('end', function() {
    fs.writeFileSync(config.feed, feed, 'utf-8'); 
    // feedparser.parseUrl(config.url, parseTweets);
    feedparser.parseFile(config.feed, parseTweets);
   });
  });
};

module.exports = pp;
