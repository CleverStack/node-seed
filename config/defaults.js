/**
 * These are the default configs. Environment specific
 * config files may override or add to this object
 * @type {Object}
 */

var path = require('path');


module.exports = {

	environment_name: 'Default',

	params: {
		appName : 'CleverTech Stub Application'
	},
	
	secretKey: 'secret',

	db: {
		driver: 'postgres',
		host: 'localhost',
		user: 'ctstub_web',
		password: 'ctstub_web',
		database: 'ctstub',
		port: 5432
	}

};