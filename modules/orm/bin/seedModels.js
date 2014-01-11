var fs = require( 'fs' )
  , path = require( 'path' )
  , utils = require( 'utils' )
  , crypto = require( 'crypto' )
  , async = require( 'async' )
  , inflect = require( 'i' )();

// Bootstrap the environment, but don't initializeModuleRoutes( injector )
var env = utils.bootstrapEnv()
  , config = env.config;

// Load all the modules
env.moduleLoader.loadModules();

// Load the seedData and get the models
var seedData = require( 'seedData' )
  , models = require( 'models' );

var assocMap = {};
Object.keys(seedData).forEach(function( modelName ) {
    assocMap[modelName] = [];
});

async.forEachSeries(
    Object.keys(seedData),
    function forEachModelType( modelName, cb ) {
        var ModelType = models.orm[modelName]
            , Models = seedData[modelName];

        async.forEachSeries(
            Models,
            function forEachModel( data, modelCb ) {
                var assocs = data.associations;
                delete data.associations;

                ModelType.create(data).success(function( model ) {
                    data.associations = assocs;

                    console.log('Created ' + modelName);
                    assocMap[modelName].push(model);
                    if ( data.associations !== undefined ) {
                        var assocLength = Object.keys(data.associations).length,
                            called = 0;

                        Object.keys(data.associations).forEach(function( assocModelName ) {
                            var required = data.associations[assocModelName]
                                , associations = [];

                            assocMap[assocModelName].forEach(function( m ) {
                                var isMatched = null;

                                Object.keys(required).forEach(function( reqKey ) {
                                    if ( isMatched !== false ) {
                                        if ( m[reqKey] === required[reqKey] ) {
                                            isMatched = true;
                                        } else {
                                            isMatched = false;
                                        }
                                    }
                                });

                                if ( isMatched ) {
                                    associations.push(m);
                                }
                            });

                            if ( associations.length ) {
                                var funcName = 'set' + inflect.pluralize(assocModelName);

                                // Handle hasOne
                                if ( typeof model[funcName] !== 'function' ) {
                                    funcName = 'set' + assocModelName;
                                    associations = associations[0];
                                }

                                console.log('Calling ' + funcName);
                                model[funcName](associations).success(function() {
                                    called++;

                                    if ( called == assocLength )
                                        modelCb(null);
                                }).error(modelCb);
                            }
                        });
                    } else {
                        modelCb(null);
                    }
                }).error(modelCb);
            },
            function forEachModelComplete( err ) {
                cb(err);
            }
        );
    },
    function forEachModelTypeComplete( err ) {
        console.log(err ? 'Error: ' : 'Seed completed with no errors', err);
        if ( config.odm && config.odm.enabled ) {
          mongoose.disconnect();
        }
    }
);