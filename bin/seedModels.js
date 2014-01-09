var crypto = require('crypto')
  , async = require('async')
  , inflect = require('i')()
  , modelInjector = require('utils').modelInjector
  , Injector = require( '../src/utils' ).injector
  , mongoose = require( 'mongoose' );

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
injector.instance( 'config', config );
injector.instance( 'db', sequelize );
injector.instance( 'sequelize', sequelize );
injector.instance( 'mongoose', mongoose );

// Get our models
var models = require( 'models' )
injector.instance( 'models', models );

// Setup ODM
if ( config.odm && config.odm.enabled ) {
  mongoose.connect(config.mongoose.uri);
}

// Run our model injection service
modelInjector( models );

var seedDataORM = require('./../schema/ORMseedData');
var seedDataODM = require('./../schema/ODMseedData');

var assocMap = {};
Object.keys(seedDataORM).forEach(function( modelName ) {
    assocMap[modelName] = [];
});

async.series([
    // ORM first
    function ( next ) {
        async.forEachSeries(
            Object.keys(seedDataORM),
            function forEachModelType( modelName, cb ) {
                var ModelType = models.ORM[modelName]
                    , Models = seedDataORM[modelName];

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
                                    var _required = data.associations[assocModelName]
                                        , associations = [];

                                    _required = Array.isArray(_required) ? _required : [_required];

                                    assocMap[assocModelName].forEach(function( m ) {
                                        _required.forEach(function ( required ) {
                                            var isMatched = null;

                                            Object.keys(required).forEach(function( reqKey ) {
                                                if ( isMatched !== false ) {
                                                    if ( m[reqKey] === required[reqKey] ) {
                                                        isMatched = true;
                                                    } else {
                                                        isMatched = false;
                                                    }
                                                }

                                                if ( isMatched ) {
                                                    associations.push(m);
                                                }
                                            });
                                        })
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
                                    } else {
                                        modelCb();
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
            }, next
        );
    },
    // Clear ODM Database
    function ( next ) {
        if ( !config.odm || config.odm.enabled !== true ) {
            return next();
        }

        //mongoos.connection.db.dropDatabase() was not working on my machine
        async.each(Object.keys(models.ODM), function ( schema, cb ) {
            models.ODM[schema].remove( cb );
        }, next);
    },
    // ODM second
    function ( next ) {
        if ( !config.odm || config.odm.enabled !== true ) {
            return next();
        }

        async.forEachSeries(
            Object.keys( seedDataODM ),
            function ( schemaName, cb ) {
                var SchemaType = models.ODM[schemaName]
                    , Schema = seedDataODM[schemaName];

                async.mapSeries(
                    Schema,
                    function mapEachSchema( data, schemaCb ) {
                        var keys = Object.keys( data )
                            ,   i = -1
                            ,   schemaAdd = {};

                        async.eachSeries( keys, function (key, keyCb ) {
                            ++i;
                            var attribute = data[key];
                            if ( typeof attribute !== "object" ) {
                                schemaAdd[key] = typeof data[key];
                                return keyCb();
                            }

                            if (!!data[key].$association) {
                                var schema = data[key].$association.$schema;

                                if ( !models.ODM[schema] ) {
                                    return keyCb( keys[i] + ' in ' + schemaName + "'s association does not exist.");
                                }

                                models.ODM[schema].findOne(data[key].$association.$where, function ( err, record ) {
                                    data[key] = ( !!record ? record._id : null );
                                    schemaAdd[key] = typeof data[key];
                                    keyCb();
                                });
                            } else {
                                async.eachSeries( Object.keys( data[key] ), function ( attrKey, attrKeyCb ) {
                                    if (!data[key][attrKey].$association) {
                                        return attrKeyCb();
                                    }

                                    var schema = data[key][attrKey].$association.$schema;

                                    if ( !models.ODM[schema] ) {
                                        return keyCb( keys[i] + ' in ' + schemaName + "'s association does not exist.");
                                    }

                                    models.ODM[schema].findOne(data[key][attrKey].$association.$where, function ( err, record ) {
                                        data[key][attrKey] = ( !!record ? record._id : null );
                                        schemaAdd[key] = typeof data[key][attrKey];
                                        attrKeyCb();
                                    });
                                }, keyCb);
                            }
                        }, function ( err ) {
                            SchemaType.schema.add(schemaAdd);
                            SchemaType.create(data, schemaCb);
                        });
                    },
                    function mapEachDone( err, schemas ) {
                        cb( err );
                    }
                );
            },
            function mongoComplete( err ) {
                // bypass err since we want to disconnect
                mongoose.disconnect(function ( mongoErr ) {
                    next( err || mongoErr );
                });
            }
        );
    }
],
    function allDone(err) {
        console.log( err ? ('Error: ' + err) : 'Seed completed with no errors' );
    });