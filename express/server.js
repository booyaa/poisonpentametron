'use strict';

var express = require('express');
var handler = require('../conf/handler.js');
var littleprinter = require('littleprinter');
var pp = require('../lib/poisonpentametron.js');

var app = express();
var port = process.env.PORT || 3030;

//set a view engine
app.set('view engine', 'ejs');
app.set(express.logger('dev'));

// start serving static files
app.use(express.static(__dirname+'/../static'));

//Override functions to pass data to paths
app.use('/edition', function(req, res, next) {
  console.log('/edition headers: %s', JSON.stringify(req.headers, null, 4));

  app.locals.absUrl = function(url) {
    var host = req.headers.host;
    return 'http://' + host + url;
  };

  if(!pp.isFeedFresh()) {
    console.log('update twitter feed');
    pp.updateFeed();
  } else { // this will vanish eventually
    console.log('display existing page');
  }

  // testing
  // pp.updateFeed();

  //run the handler in littleprinter
  next(); 
});

//Override functions to pass data to paths
app.use('/sample', function(req, res, next) {
  console.log('/sample headers: %s', JSON.stringify(req.headers, null, 4));

  app.locals.absUrl = function(url) {
    var host = req.headers.host;
    return 'http://' + host + url;
  };

  //run the handler in littleprinter
  next(); 
});


//start little printer express server
littleprinter.setup(app, handler);

//start listening
app.listen(port);

console.log('listening on port %d', port);
