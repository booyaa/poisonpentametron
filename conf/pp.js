// config file

var config = {
  feed : './stage/pentametron.rss',
  maxAgeInHours : 1,
  url : 'http://booyaa.org/pentametron.rss',
  maxLines : 8,
  tweetRegExp : /pentametron: RT @\w+: (.*)/i,
  rawFile : './stage/rawfile.txt',
  // stripCharsRegExp : /[:).]/g,
  // stripCharsRegExp : /[^\w\s!?]/gi,
  stripCharsRegExp : /[^A-Za-z\s!?]/gi,
  cleanFile : './stage/cleanFile.txt',
  poetryBannerFile : './views/poetry-banner.ejs',
  poetryPlainFile : './views/poetry-plain.ejs'

};

module.exports = config;
