var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');

var supportedOptions = [ 'directory', 'token' ];

function FSAdapter (options) {
	var self = this;

	self.loadedResources = [];  // Array of loaded Resources

	self.options = _.pick(options, supportedOptions);

	if (self.options.directory) {
		self.absoluteDirectoryPath = self.options.directory;
	}

  self.dropbox = require('node-dropbox').api(self.options.token);
  Promise.promisifyAll(self.dropbox);
}

FSAdapter.prototype.validateDirectory = function validateDirectory () {
	var self = this;

	if (_.isEmpty(self.options.directory) || !_.isString(self.options.directory)) {
		return Promise.reject(new Error('Incorrect directory ' + self.options.directory));
	}

  return self.dropbox.getMetadataAsync(self.options.directory)
    .then(function (res) {
      if (404 === res.statusCode) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Directory ' + self.absoluteDirectoryPath + ' exists'));
    });
};

FSAdapter.prototype.createDirectory = function createDirectory () {
  return this.dropbox.createDirAsync(this.absoluteDirectoryPath);
};

FSAdapter.prototype.cleanDirectory = function cleanDirectory () {
	if (!_.isEmpty(this.loadedResources)) {
		return this.dropbox.removeDirAsync(this.absoluteDirectoryPath);
	}
	return Promise.resolve();
};

FSAdapter.prototype.saveResource = function saveResource (resource) {
	var self = this;

	var filename = path.join(self.absoluteDirectoryPath, resource.getFilename());
	var text = resource.getText();
  return self.dropbox.createFile(filename, text)
    .then(function resourceSaved () {
  		self.loadedResources.push(resource);
  	});
};

module.exports = FSAdapter;
