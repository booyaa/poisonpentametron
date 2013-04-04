var fs = require('fs-extra')
  , path = require('path')
  , util = require('util')
  , async = require('async')
  , nconf = require('nconf');
  

var config = nconf.file('./conf/pp.' + (process.env.NODE_ENV || 'development') + '.json').load();

require('date-utils');
var dayNo = (new Date()).getDay();

console.log('env: %s', process.env.NODE_ENV);
console.log('config:\n%s', JSON.stringify(config, null, 4));
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


//FIXME: redundant
function resetVariables(cb) {
  // reset variables
  console.log('\t\tresetVariables');
  //FIXME: .dayno-HHmm
  cb(null, config.feed, config.feed+'.old');
}

function renameOldFeed(cb) { //FIXME I think this is might be redundant too
  // might keep if i need a friendly error messsage from fs.rename
  // rename old feed (just in case)
  var newName = config.feed + "." + dayNo;

  console.log('\t\trenameOldFeed: %s %s', config.feed, newName);

  fs.rename(config.feed, newName, function(err) {
    if (err) {
      if (err.errno === 34) {
        console.log('\t\trenameOldFeed: couldn\'t rename %s (deleted by another a process?)',config.feed);

        //do i care if we fail to rename, probably not 
        cb(null);
      } else {
        // unknown error
        cb(err);
      }
    } else {
      cb(null);
    }
  });
}

// get a new copy of feed
function downloadFeed(cb) {
  var request = require('request');
  request(config.url, function(err, response, body) {
    if (err) {
      if (err.code === "ENOTFOUND" && err.syscall === "getaddrinfo") {
        cb(new Error('no internets!'));
      } else {
        console.log('\t\tdownloadFeed error: %s', JSON.stringify(err, null, 4));
        cb(err);
      }
    } else {
      console.log('\t\tdownloadFeed saving...');

      fs.writeFile(config.feed, body, 'utf-8', function(err) {
        if (err) {
          cb(err);
        } else {
            var archiveName = util.format("%s%s%s.%d%s" // ./stage / foo .1 .json
                                  , path.dirname(config.feed)
                                  , path.sep
                                  , path.basename(config.feed,path.extname(config.feed))
                                  , dayNo
                                  , path.extname(config.feed));
            console.log("\t\tdownloadFeed archivename: %s", archiveName);
            fs.writeFile( archiveName, body, 'utf-8', function(err) {
              if (err) {
                cb(err);
              } else {
                cb(null);
              }
            });
        }
      });
    }
  });
}

// parse feed
function parseTweets(cb) {
  var feedparser = require('feedparser')
    , rawPoetry = [];

  feedparser.parseFile(config.feed, function( err, meta, articles) {
    var i = 0;
    if (err) {
      console.log('\t\tparseTweets error: %s', JSON.stringify(err, null, 4));
      cb(err);
    } else {
      console.log('\t\tparseTweet debug show 8 tweets');
      articles.forEach(function(article) {
       if (i < 8) {
          var found = article.title.match(new RegExp(config.tweetRegExp, config.tweetRegExpOpt));
          rawPoetry.push(found[1]);
          i++;
          console.log('\t\t%s - %s', article.pubDate.toString().substr(0,24), found[1].substr(0,41));
        }
      });

      console.log('\t\tparseTweets: no of rawTweets:  %d', rawPoetry.length);
      cb(null, config.rawFile, rawPoetry, 'utf-8');
    }
  });
}

function saveRawFile(fileName, rawPoetry, encoding, cb) {
  console.log('\t\tsaveRawPoetry lines: %s', rawPoetry.length);
  fs.writeFile(fileName, JSON.stringify(rawPoetry, null, 4), encoding, function(err) {
    if (err) {
      cb(err);
    } else {
        var archiveName = util.format("%s%s%s.%d%s" // ./stage / foo .1 .json
                                  , path.dirname(fileName)
                                  , path.sep
                                  , path.basename(fileName,path.extname(fileName))
                                  , dayNo
                                  , path.extname(fileName));
   
      fs.writeFile(archiveName, JSON.stringify(rawPoetry, null, 4), encoding, function(err) {
        if (err) {
          cb(err);
        } else {
            cb(null, rawPoetry);
        }
      });
    }
  });
}

function cleanText(rawPoetry, cb) {
  // remove RT and @'s
  // remove any characters not supported
  var cleanPoetry = [];

  rawPoetry.forEach(function(line) {
    var lowerCased = line.toLowerCase();
    var stripChars = lowerCased.replace(new RegExp(config.stripCharsRegExp, config.stripCharsRegExpOpt), '');
    cleanPoetry.push(stripChars);
  });

  fs.writeFile(config.cleanFile, JSON.stringify(cleanPoetry, null, 4), 'utf-8', function(err) {
    if (err) {
      console.error('\t\tcleanText error: %s', JSON.stringify(err, null, 4));
      cb(err);
    } else {
        var archiveName = util.format("%s%s%s.%d%s" // ./stage / foo .1 .json
                            , path.dirname(config.cleanFile)
                            , path.sep
                            , path.basename(config.cleanFile,path.extname(config.cleanFile))
                            , dayNo
                            , path.extname(config.cleanFile));
      fs.writeFile(archiveName, JSON.stringify(cleanPoetry, null, 4), 'utf-8', function(err) {
        if (err) {
          console.error('\t\tcleanText error: %s', JSON.stringify(err, null, 4));
          cb(err);
        } else {
          console.log('\t\tcleanText lines: %s typeof %s', cleanPoetry.length, typeof cleanPoetry);
          cb(null, cleanPoetry);
        }
      })
    }
  });
} // cleanText

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
      poetry += "<img src=\"<%= absUrl('/images/" + char + ".gif') %>\" />\n";
    }

    poetry += "<br />\n";
  }

  fs.writeFile(config.poetryBannerFile, poetry, 'utf-8', function(err) {
    if (err) {
      console.error('\t\tcreateMatrix error: %s', JSON.stringify(err, null, 4));
      cb(err);
    } else {
      console.log('\t\tcreateMatrix created banner file!');
      cb(null, cleanPoetry);
    }
  }); 

} // createMatrix

function createPlainText(cleanPoetry, cb) {
  var poetryPlain = "";

  cleanPoetry.forEach(function(line) {
    poetryPlain += line + "<br />\n";
  });

  fs.writeFile(config.poetryPlainFile, poetryPlain, 'utf-8', function(err) {
    if (err)  {
      console.error('\t\tcreatePlainText error: %s', JSON.stringify(err, null, 4));
      cb(err);
    } else {
      console.log('\t\tcreatePlainText win!');
      cb(null);
    }
  });
}

function debugCopyFiles(cb) {
  var hasErrors = false;
  fs.readdir(config.stageDir, function(err, files) {
    files.forEach(function(file) {
      if (file.substring(0,1) !== '.') { // not interested in dotfiles
          fs.copy(config.stageDir + file, config.staticDir + file, function(err) {
            if (err) {
              console.log("\t\tdebugCopyFiles failed to copy %s => %s", config.stageDir + file, config.staticDir + file);
              hasErrors = true;
            } else {
              console.log("\t\tdebugCopyFiles %s copied", file);
            }
          });
      }
    });

    console.log('\t\tdebugCopyFiles hasErrors: %s', hasErrors);
    if (hasErrors) {
      cb(new Error('debugCopyFiles Failed to copy all files'));
    } else {
      cb(null);
    }
  });

}
pp.updateFeed = function(cb) {
  var waterfall = [downloadFeed, parseTweets, saveRawFile, cleanText, createMatrix, createPlainText, debugCopyFiles];

  console.log('\tstart time: %s', new Date());
  async.waterfall(waterfall, function(err) {
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

module.exports = pp;
