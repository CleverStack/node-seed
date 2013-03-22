/**
 * Main application's configuration file.
 * @author Mason Houtz <mason@clevertech.biz>
 */


// Defaults will be loaded and merged with an environment-specific
// config file. This will let us vary the configs based on an
// environment setting that we pass in when we launch node.js
// ex: NODE_ENV=test node app.js

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	defaults = require('./defaults'),
	envConfigs = {};



// Blocking operations necessary to load environment
// specific configuration file. Unless somebody has a
// much better idea?

var env = process.env.NODE_ENV || 'dev';
if (env) {
	var envPath = '/' + env + '.js';
	var absPath = path.resolve(__dirname + envPath);
	var fileExists = fs.existsSync(absPath);
	if (fileExists)
		envConfigs = require('./' + env);
}


// merge optional environment-specific configs
// So you can override database connection info
// in different environments.

var configs = _.extend(defaults, envConfigs);


module.exports = configs;
