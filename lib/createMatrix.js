'use strict';

var nconf = require('nconf');
  

var config = nconf.file('./conf/pp.' + 
                          (process.env.NODE_ENV || 'development') + 
                          '.json').load();

function createMatrix(cleanPoetry, cb) {
  // load text into array of lines
  // get maxWidth
  console.log('\t\tcreateMatrix cleanPoetry typeof: %s', typeof cleanPoetry);
  var maxWidth = 0;
  cleanPoetry.forEach(function(line) {
    if (line.length > maxWidth) {
      maxWidth = line.length;
    }
  });

  console.log('\t\tcreateMatrix largest line width: %d', maxWidth);

  var _s = require('underscore.string');

  // pad array to maxWidth
  var padded = cleanPoetry.map(function(line) {
    return _s.rpad(line, maxWidth, ' ');
  });

  // transpose
  var matrix = [];
  padded.forEach(function(line) {
    matrix.push(line.split(''));
  });

  var array = require('array-extended')
    , transpose = array(matrix).transpose().value();

  var poetry = "";

  // walk array and translate characters to images
  for(var x = 0; x < transpose.length; x++) {
    var row = transpose[x];

    for(var y = row.length-1; y >= 0; y--) {
      var char = row[y];
      if (char === " ") { char = "blank"; }
      if (char === "!") { char = "exclaim"; }
      if (char === "?") { char = "question"; }
      if (char === "*") { char = "asterisk"; }
      poetry += "<img src=\"<%= absUrl('/images/" + char + ".gif') %>\" />\n";
    }

    poetry += "<br />\n";
  }

  cb(null, config.poetryBannerFile, poetry, 'utf-8');
  // fs.writeFile(config.poetryBannerFile, poetry, 'utf-8', function(err) {
  //   if (err) {
  //     console.error('\t\tcreateMatrix error: %s', JSON.stringify(err, null, 4));
  //     cb(err);
  //   } else {
  //     console.log('\t\tcreateMatrix created banner file!');
  //     cb(null, cleanPoetry);
  //   }
  // }); 

} // createMatrix

module.exports.createMatrix = createMatrix;
