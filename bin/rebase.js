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

// Get our models
var models = require('./../src/model')(sequelize);

// Force a sync
console.log('Forcing Database to be created! (Note: All your data will disapear!)');

sequelize
.sync({force:true})
.success(function() {
	console.log('Database is rebased');
})
.error(function(err) {
	console.error('Error trying to connect to ' + config.db.options.dialect, err);
})