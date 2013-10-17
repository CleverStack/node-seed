var fs = require('fs')
  , Injector = require( '../src/utils' ).injector;

// Get the application config
var config = require('./../config');

// Setup ORM
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db.options
);

GLOBAL.injector = Injector(  __dirname + '/src/services', __dirname + '/src/controllers' );
injector.instance( 'sequelize', sequelize );
injector.instance( 'config', config );

// Get our models
var models = require('../src/models');

// Force a sync
console.log('Forcing Database to be created! (Note: All your data will disapear!)');

sequelize
.sync({force:true})
.success(function() {
	fs.readFile(__dirname + '/../schema/' + config.db.options.dialect + '.sql', function(err, sql) {
		if (err || !sql) {
			console.log('Database is rebased');
		} else {
			console.log('Running dialect specific SQL');
			sequelize.query(sql.toString()).success(function() {
				console.log('Database is rebased');
			}).error(function(err) {
				console.error(err);
			});
		}
	});
})
.error(function(err) {
	console.error('Error trying to connect to ' + config.db.options.dialect, err);
});