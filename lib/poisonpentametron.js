'use strict';

var fs = require('fs-extra')
  , async = require('async')
  , nconf = require('nconf');
  

var config = nconf.file('./conf/pp.' + (process.env.NODE_ENV || 'development') + '.json').load();

require('date-utils');
var pp = {};

pp.poetry = "";
pp.poetryPlain = "";
pp.rawPoetry = [];
pp.cleanPoetry = [];
pp.checkSum = 0;

pp.isFeedFresh = function(cb) {
  // checks if conf.Feed is older than conf.maxAgeInMinutes
  
    console.log('\tisFeedFresh checking how old feed is');
    console.log(config.feed);
    fs.stat(config.feed, function(err, stats) {
      if (err) {
          if (err.errno === 34) {
            console.error('\tisFeedFresh error: Feed not found!');
            cb(new Error('Feed not found!'));
          } else {
            console.error('\tisFeedFresh Unhandled error: %s', JSON.stringify(err, null, 4));
            cb(err);
          }
      } else {
          var feed = new Date(stats.mtime)
            , now = new Date()
            , delta = feed.getMinutesBetween(now);

          console.log('\tisFeedFresh stats:\n\t\t%s\n\t\tnow %s\n\t\tdelta (min) %s\n\t\tthreshold (min) %s', feed, now, delta, config.maxAgeInMinutes);
          cb(null, delta < config.maxAgeInMinutes);
      }
    });
};

function start(cb) {
  console.log('start');
  return cb(null, config.url);
}

var downloadFeed = require('./download.js').downloadFeed
  , parseTweets = require('./parseTweets.js').parseTweets
  , saveFile = require('./archiveFile.js').saveFile
  , saveAndArchiveFile = require('./archiveFile.js').saveAndArchiveFile
  , cleanText = require('./sanitiseTweets.js').cleanText
  , createMatrix = require('./createMatrix.js').createMatrix
  , createPlainText = require('./createPlainText.js').createPlainText;

function finished(d, cb) { // mock cleanText
   console.log('finished d: %s', typeof d);
   cb(null);
}

pp.updateFeed = function(cb) {
  var waterfall = [start, downloadFeed, saveAndArchiveFile, parseTweets, saveAndArchiveFile, cleanText, saveAndArchiveFile, 
    function glue(data, cb) {
      createMatrix(data, function(err, file, data2, encoding) {

        if (err) {
          return cb(err);
        }

        saveFile(file, data2, encoding, function(meh) {
          console.log('created banner: %s', typeof meh);

          createPlainText(data, function(err, file, data3, encoding) {
            saveFile(file, data3, encoding, function(meh) {
              console.log('created plain: %s', typeof meh);
              cb(null, meh); // :(
            }); // saveFileInner
          }); // createPlainText
        }); // saveFile outer
      }); // createMatrix
    },finished];
    
  console.log('\tstart time: %s', new Date());
  async.waterfall(waterfall, function finished(err) {
      if (err) {
        // 500
        console.log('\tupdateFeed error: %s', JSON.stringify(err, null, 4));
        cb(err);
      } else {
        console.log('\tupdateFeed completed successfully!');
        console.log('\tend time: %s', new Date());
        cb(null);
      }
  });

};

pp.ok = function() { return true; };
module.exports = pp;
