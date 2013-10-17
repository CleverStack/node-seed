// Get the application config
GLOBAL.config = require('./../config');

// Setup ORM
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db.options
);
GLOBAL.db = sequelize;

// Get our models
GLOBAL.models = require('./../src/models')(sequelize, config);

// Launch our background process class
GLOBAL.backgroundTasksClass = require('./../src/classes/BackgroundTasks.js');
GLOBAL.backgroundTasks = new backgroundTasksClass(config, models);
