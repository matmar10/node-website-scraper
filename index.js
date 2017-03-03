var Scraper = require('./lib/scraper.js');

var factoryMethod = function scrape (options, callback) {
	return new Scraper(options).scrape(callback);
};

factoryMethod.LocalFSAdapter = Scraper.LocalFSAdapter;
factoryMethod.DropboxFSAdapter = Scraper.DropboxFSAdapter;

module.exports = factoryMethod;
