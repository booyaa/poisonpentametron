'use strict';

var nconf = require('nconf')
  , config = nconf.file('./conf/pp.' + (process.env.NODE_ENV || 'development') + '.json').load();

var request = require('request');
console.log('download!');

function downloadFeed (url, cb) {
  console.log('downloadFeed: %s', url);
  request(url, function(e,r,b) {
    if (e) {
      if ((e.code === "ENOTFOUND" && e.syscall === "getaddrinfo") ||
         (e.code === "EHOSTUNREACH" && e.syscall === "connect")) {
        return cb((new Error('No internets!')));
      }
      console.log('download: %s', e);
      return cb(e);
    }

    if (r.statusCode !== 200) {
      return cb((new Error('Server returned: ' + r.statusCode)));
    }

    if (typeof b === "undefined") {
      return cb((new Error('Feed was empty!')));
    }

    return cb(null, config.feed, b, 'utf-8'); // FIXME needs to be a config
  });
}

module.exports.downloadFeed = downloadFeed;
