module.exports = require('nconf').loadFilesSync([
	__dirname + '/global.json',
	__dirname + '/' + (process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : 'local') + '.json'
]);