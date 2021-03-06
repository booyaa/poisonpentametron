'use strict';

var fs = require('fs')
  , pp = require('../lib/archiveFile.js');

exports['archiveFile'] = {
  setUp: function(done) {
    // setup here
    this.fileName = 'stage/hello.txt';
    require('date-utils');
    this.dayNo = (new Date()).getDay();
    done();
  },
  'correctArchiveName': function(test) {
    test.equal(pp.getArchiveFileName(this.fileName), 'stage/hello.' + this.dayNo + '.txt', 'should return correct archive name');
    test.done();
  },
  'handle exceptions': function(test) {
    //do we need a callback for a trivial function?  test.equal(e.message, 'No internets!', 'Error should be no net connection');
    test.throws(function() { pp.getArchiveFileName(null); });
    test.throws(function() { pp.getArchiveFileName(""); });
    test.throws(function() { pp.getArchiveFileName(1); });
    test.done();
  }
};


exports['saveFile'] = {
  setUp: function(done) {
    // setup here
    this.fileName = 'stage/hello.txt';
    this.data = 'hello world';
    this.encoding = 'utf-8';
    done();
  },
  tearDown: function(done) {
    fs.unlinkSync(this.fileName);
    done();
  },
  'saveFile': function(test) {
    var data = this.data
      , fileName = this.fileName; // FIXME: fugly

    pp.saveFile(fileName, this.data, this.encoding, function(err, d) {
      test.equal(err, undefined, 'there should be no errors');
      test.equal(d, data, 'should return data');

      test.ok(fs.existsSync(fileName), 'save file should exist');
      test.done();
    });
  }
};

exports['saveAndArchiveFile'] = {
  setUp: function(done) {
    // setup here
    this.fileName = 'stage/hello.txt';
    this.archiveFileName = pp.getArchiveFileName(this.fileName); // stage/hello.dayNo.txt
    this.data = 'hello world';
    this.encoding = 'utf-8';
    done();
  },
  tearDown: function(done) {
    fs.unlinkSync(this.fileName);
    fs.unlinkSync(this.archiveFileName);
    done();
  },
  'saveAndArchiveFile test': function(test) {
    var data = this.data
      , fileName = this.fileName
      , archiveFileName = this.archiveFileName; // FIXME: fugly

    pp.saveAndArchiveFile(fileName, this.data, this.encoding, function(err, d) {
      console.log('testing saveAndAr..');
      test.equal(err, undefined, 'there should be no errors');
      test.equal(d, data, 'should return data');

      test.ok(fs.existsSync(fileName), 'save file should exist');
      test.ok(fs.existsSync(archiveFileName), 'archived file should exist');
      test.done();
    });
  }
};
