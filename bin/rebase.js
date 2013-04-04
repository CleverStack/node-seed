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

// Force a sync
sequelize.sync({force:true})