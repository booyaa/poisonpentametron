'use strict';

var nconf = require('nconf');

var config = nconf.file('./conf/pp.' + 
                          (process.env.NODE_ENV || 'development') + 
                          '.json').load();

function createPlainText(cleanPoetry, cb) {
  var poetryPlain = "";

  cleanPoetry.forEach(function(line) {
    poetryPlain += line + "<br />\n";
  });

  cb(null, config.poetryPlainFile, poetryPlain, 'utf-8');
  // fs.writeFile(config.poetryPlainFile, poetryPlain, 'utf-8', function(err) {
  //   if (err)  {
  //     console.error('\t\tcreatePlainText error: %s', JSON.stringify(err, null, 4));
  //     cb(err);
  //   } else {
  //     console.log('\t\tcreatePlainText win!');
  //     cb(null);
  //   }
  // });
}

module.exports.createPlainText = createPlainText;
