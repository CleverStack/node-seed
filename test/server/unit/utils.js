var config = require('../../../config')
  , defineModels = require('model')
  , Injector = require('utils').injector
  , Sequelize = require('sequelize')
  , Q = require('q');

exports.testEnv = function (fn) {
    var deferred = Q.defer();

    var db = new Sequelize(
        config.testDb.database, 
        config.testDb.username, 
        config.testDb.password,
        config.testDb.options
    );

    var models = defineModels(db, config);
    models.TestModel = db.define('Test', {
        name: Sequelize.STRING,
    }, {
        paranoid: true
    });

    var injector = Injector(  __dirname + '/../../../src/service', __dirname + '/../../../src/controllers' );
    injector.instance( 'config', config );
    injector.instance( 'models', models );
    injector.instance( 'db', db );

    db
    .sync({force:true})
    .success(function () {
        injector.inject(fn);
    })
    .error(function (err) {
        throw err;
    });
};
