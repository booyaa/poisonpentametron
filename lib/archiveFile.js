'use strict';

var fs = require('fs');

function getArchiveFileName(f) {
  if (typeof f !== "string") {
      throw new Error('Expected string');
  }

  if (f.length <= 0) {
      throw new Error('Empty string');
  }

  var util = require('util'), path = require('path');
  require('date-utils');
  var dayNo = (new Date()).getDay();

  var archiveName = util.format("%s%s%s.%d%s" // ./stage / foo .1 .json
         , path.dirname(f)
         , path.sep
         , path.basename(f, path.extname(f))
         , dayNo
         , path.extname(f));
  return archiveName;
}

function saveFile (fileName, data, encoding, cb) {
  console.log('saveFile: %s', fileName);
  if (typeof fileName !== "string") {
    return cb(new Error('Invalid file name'));
  }

  var dataStringified = "";
  if (typeof data !== "string") {
    dataStringified = JSON.stringify(data, null, 4);
  } else {
    dataStringified = data;
  }

  var archiveFileName = getArchiveFileName(fileName);

  fs.writeFile(fileName, dataStringified, encoding, function(err) {
    if (err) {
      if (err.errno === 34 && err.code === 'ENOENT' && err.path === fileName) {
        return cb(new Error("Failed to save file invalid path"));
      } else {
        console.log('err1: ', err );
        return cb(err);
      }
    }

    fs.writeFile(archiveFileName, dataStringified, encoding, function(err) {
      if (err) {
        return cb(new Error("Failed to save archive: " + err.message));
      }
      // return cb(null, fileName);
      return cb(null, data);
    });
  });
}

module.exports.getArchiveFileName = getArchiveFileName;
module.exports.saveFile = saveFile;
