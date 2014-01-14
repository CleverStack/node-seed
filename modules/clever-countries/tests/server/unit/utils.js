var config = require('../../../config')
  , Injector = require('utils').injector
  , modelInjector = require('utils').modelInjector
  , Sequelize = require('sequelize')
  , Q = require('q')
  , mongoose = require( 'mongoose' )
  , Migrator = require( '../../../node_modules/sequelize/lib/migrator' )
  , Utils = require( '../../../node_modules/sequelize/lib/utils' )
  , async = require( 'async' )
  , path = require( 'path' )
  , seed = require( path.resolve( [__dirname, '..', '..', '..', 'schema', 'seedData.json'].join( path.sep ) ) )
  , _ = require( 'underscore' )
  , connected = false;

GLOBAL.injector = Injector(  __dirname + '/../../../src/services', __dirname + '/../../../src/controllers' );
var db = new Sequelize(
    config.testDb.database,
    config.testDb.username,
    config.testDb.password,
    config.testDb.options
);

injector.instance( 'config', config );
injector.instance( 'db', db );
injector.instance( 'sequelize', db );
injector.instance( 'mongoose', mongoose );

// Get our models
var models = require( 'models' );
injector.instance( 'models', models );

// Run our model injection service
modelInjector( models );

before(function( done ) {
    this.timeout( 0 );

    // Setup ODM
    if ( config.odm && config.odm.enabled && connected === false ) {
      connected = true;
      mongoose.connect(config.mongoose.uri);
    }

    models.ORM.TestModel = db.define('Test', {
        name: Sequelize.STRING,
    }, {
        paranoid: true
    });

    models.ORM.TestModel.ORM = true

    require('child_process').exec( 'grunt db', function( err, stdout, stderr ) {
        done( err );
    });
});

module.exports.testEnv = function( fn ) {
    injector.inject( fn );
}
