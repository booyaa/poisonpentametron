'use strict';

var versionString = 'v014';

var express = require('express');
var handler = require('../conf/handler.js');
var littleprinter = require('littleprinter');
var pp = require('../lib/poisonpentametron.js');

var app = express();
// var port = process.env.PORT || 3030;
//start listening
var port = 3030;
app.listen(port);

//set a view engine
app.set('view engine', 'ejs');
app.set(express.logger('dev'));

// start serving static files
app.use(express.static(__dirname+'/../static'));

//Override functions to pass data to paths
app.use('/edition', function(req, res, next) {
  console.log('/edition\nip: %s\nheaders: %s', req.connection.remoteAddress, JSON.stringify(req.headers, null, 4));

  // source? somewhere on so
  app.locals.absUrl = function(url) {
    var host = req.headers.host;
    return 'http://' + host + url;
  };

  pp.isFeedFresh(function(err, fresh) {
    var dafuq = "xx";
    if (err || ! fresh ) { 
        // console.log('index error: %s', JSON.stringify(err, null, 4));
        console.log('feed not found, updating');
        pp.updateFeed(function(err) {
          console.log('pp.updateFeed');
          if (err) {
            console.log('updating error, sending http 500: %s', err);
            res.send(500);
            //run the handler in littleprinter
            next(); 
          } else {
            console.log('updated feed, displaying');
            dafuq = "yes";
            req.query.fresh = dafuq;
            //run the handler in littleprinter
            next(); 
          }
        });
    } else {
        console.log('feed is fresh, display existing content');
        dafuq = "no";
        req.query.fresh = dafuq;
        //run the handler in littleprinter
        next(); 
    }
  });
});

//Override functions to pass data to paths
app.use('/sample', function(req, res, next) {
  console.log('/sample\nip: %s\nheaders: %s', req.connection.remoteAddress, JSON.stringify(req.headers, null, 4));

  app.locals.absUrl = function(url) {
    var host = req.headers.host;
    return 'http://' + host + url;
  };

  //run the handler in littleprinter
  next(); 
});


//start little printer express server
littleprinter.setup(app, handler);


console.log('0 listening on port %d %s', port, versionString);
