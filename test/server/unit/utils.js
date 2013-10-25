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
    var migrator = new Migrator( db, { from: null, path: __dirname + '/../../../migrations'} );

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

    var ormKeys     = Object.keys ( models.ORM )
        , seedKeys  = Object.keys ( seed );

    db
    .sync( { force: true } )
    .success(function () {
        // before running the test we have to build our entire database with orm.json and seedData details.
        // setAssocs = query chain for setting associations
        // createRows = query chain for creating the rows within the model
        // createAssocs = query chain  for creating the associations

        // the function may seem complex, but the concept is actually simple.
        // First, migrate all of the data in order to build our models correctly
        // Second, create all of the records so we can associate without any problems
        // Third, due to the nature of Sequelize and CleverTech's seedData.json, we have to
        //   perform a .find() in order to get the correct DAO and the DAOFactory associated with it.
        migrator.findOrCreateSequelizeMetaDAO( { force: true } ).success(function() {
            migrator.migrate().success(function( SequelizeMeta ) {
                var createRows   = new Utils.QueryChainer()
                ,   setAssocs    = new Utils.QueryChainer()
                ,   associations = []
                ,   filtered     = ormKeys.filter( function( ModelKey ) {
                    return seedKeys.indexOf(models.ORM[ModelKey].name) > -1;
                } );

                // If we don't ave any data to populate the model with, skip
                // this entire operation.
                if ( filtered.length < 1) {
                    return done();
                }

                filtered.forEach(function( model ) {
                    var data = seed[model];

                    data.forEach(function( record ) {
                        associations.push( _.pick( record, 'associations' ) );
                        createRows.add( models.ORM[model].create( _.omit( record, 'associations' ) ) );
                    });
                });

                createRows.runSerially().success(function( records ) {
                    var assocChain = new Utils.QueryChainer();

                    records.forEach(function( record, i ) {
                        if ( !associations[i] || !associations[i].associations ) {
                            return true;
                        }

                        var assocModels = Object.keys( associations[i].associations );
                        if ( assocModels.length < 1 ) {
                            return true;
                        }

                        async.eachSeries( assocModels, function( assocModel, next ) {
                            var assocFn = record['add' + assocModel] || record['set' + assocModel]
                            , assocRows = Array.isArray( associations[i].associations[assocModel] ) ? associations[i].associations[assocModel] : [associations[i].associations[assocModel]];

                            async.eachSeries( assocRows, function( assocRow, _next ) {
                                models.ORM[assocModel].find({where: assocRow}).success(function( rows ) {
                                    assocChain.add( assocFn.call( record, rows ) );
                                    _next();
                                })
                                .error( _next );
                            }, next);
                        },
                        function( err ) {
                            if ( !!err ) {
                                return done( err );
                            }

                            assocChain.runSerially().complete( done );
                        });
                    });
                })
            })
            .error( done );
        })
        .error( done );
    })
    .error( done );
});

module.exports.testEnv = function( fn ) {
    injector.inject( fn );
}
