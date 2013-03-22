/**
 * Sample dev configuration. Copy this file
 * to dev.js, and set the database configs to
 * match your local development database.
 *
 * @type {Object}
 */

module.exports = {

	environment_name: 'Development',

	// Merge happens recursively so you can only change what you need to
	db: {
		username: 'localdev',
		user: 'localdev',
		database: 'localdev'
	}

};