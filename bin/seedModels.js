var crypto = require('crypto')
  , async = require('async');

// Setup ORM
var config = require('./../config');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    config.db.dialect,
    config.db.database, 
    config.db.username, 
    config.db.password,
    config.db.options
);

// Get our models
var models = require('./../src/model')(sequelize);

var seedData = {
	Role: [
		{
			name: 'Admin'
		}
	],
	User: [
		{
			username: 'admin',
			password: crypto.createHash('sha1').update('password').digest('hex'),
			firstName: 'Admin',
			lastName: 'User',
			assocations: {
				Role: seedData.Role[0]
			}
		}
	]
}

async.forEachSeries(
	Object.keys(seedData),
	function forEachModelType(modelName, cb) {
		var model = models[modelName]
		  , data = seedData[modelName];

		model.create(data).success(cb).error(cb);
	},
	function forEachModelTypeComplete(err) {
		console.log(err ? 'Error: ' + err : 'Seed completed with no errors')
	}
);