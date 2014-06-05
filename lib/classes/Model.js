var Class = require( 'uberclass' )
  , debug = require( 'debug' )( 'Models' )
  , moduleLoader = injector.getInstance( 'moduleLoader' )
  , Promise = require( 'bluebird' )
  , async = require( 'async' );

module.exports = Class.extend(
/* @Static */
{
    softDeletable: false,

    versionable: false,

    timeStampable: true,

    type: 'ORM',

    extend: function() {
        var extendingArgs = [].slice.call( arguments )
          , modelName = extendingArgs.shift()
          , Static = ( extendingArgs.length === 2 )
                ? extendingArgs.shift()
                : {}
          , Proto = extendingArgs.shift()
          , extendingArgs = [ Static, Proto ]
          , modelType = Static.type !== undefined
                ? Static.type
                : this.type
          , moduleName = 'clever-' + modelType.toLowerCase()
          , driver = null;

        debug( [ 'Defining the', modelName, '(' + modelType + ')', 'model...' ].join( ' ' ) );

        // Add the name into the Static
        Static.name = modelName;

        // Check to see if the module we need is enabled!
        if ( moduleLoader.moduleIsEnabled( moduleName ) !== true ) {
            throw new Error( [ 'To use type', modelType, 'on your', modelName, 'model you need to enable the', moduleName, 'module!' ].join( ' ' ) );
        } else {
            Static._driver = driver = injector.getInstance( modelType.toLowerCase() === 'orm' ? 'cleverOrm' : 'cleverOdm' );
        }

        // Remove the actual properties from the Proto section so we can use __defineGetter__ and __defineSetter__
        Object.keys( Proto ).forEach( this.callback( 'getSchemaFromProto', Proto, Static ) );

        // Define behaviours in Static for driver module to use
        [ 'softDeletable', 'versionable', 'timeStampable' ].forEach(function( behaviour ) {
            Static[ behaviour ] = Static[ behaviour ] !== undefined
                ? Static[ behaviour ]
                : this[ behaviour ];
        }.bind( this ));

        // Add the accessedAt field if we are timeStampable
        if ( Static.timeStampable === true ) {
            Static._schema.createdAt = Date;
            Static._schema.updatedAt = Date;
            Static._schema.accessedAt = Date;
        }

        // Parse the _schema into an actual model we can use
        Static._model = driver.parseModelSchema( Static, Proto );

        // Call extend on the parent
        return this._super.apply( this, extendingArgs );
    },

    getSchemaFromProto: function( Proto, Static, key ) {
        var prop = Proto[ key ];

        if ( prop === Date || prop === String || prop instanceof String || prop === Number || prop === Boolean || ( typeof prop === 'object' ) ) {
            if ( typeof Static._schema !== 'object' ) {
                Static._schema = {};
            }

            Static._schema[ key ] = prop;
            delete Proto[ key ];
        }
    },

    find: function( id ) {
        var that = this
          , options = {};

        if ( !!id ) {
            options.id = id;
        }

        if ( !!that.softDeletable ) {
            options.deletedAt = null;
        }

        return new Promise(function( resolve, reject ) {
            async.waterfall(
                [
                    function getModel( callback ) {
                        that._model
                            .find( { where: options } )
                            .success( that.callback( callback, null ) )
                            .error( callback );
                    },

                    function updateIfTimestampable( model, callback ) {
                        if ( !!model && that.timeStampable === true ) {
                            model.updateAttributes( { accessedAt: Date.now() } )
                                .success( that.callback( callback, null ) )
                                .error( callback );
                        } else {
                            callback( null, model );
                        }
                    }
                ],
                function( err, model ) {
                    !err && !!model ? resolve( new that( model ) ) : reject( !!err ? err : 'Model not found.' );
                }
            );
        });
    },

    findAll: function( options ) {
        var that = this;

        if ( !!that.softDeletable ) {
            options.deletedAt = null;
        }

        return new Promise(function( resolve, reject ) {
            async.waterfall(
                [
                    function getModel( callback ) {
                        that._model
                            .findAll( { where: options } )
                            .success( that.callback( callback, null ) )
                            .error( callback );
                    },

                    function updateIfTimestampable( models, callback ) {
                        if ( that.timeStampable === true ) {
                            var accessedAt = Date.now();

                            async.each(
                                models,
                                function updateModel( model, cb ) {
                                    model.updateAttributes( { accessedAt: accessedAt } )
                                        .success( that.callback( cb, null ) )
                                        .error( cb );
                                },
                                function( err ) {
                                    callback( err ? err : null, models );
                                }
                            )
                        } else {
                            callback( null, models );
                        }
                    }
                ],
                function( err, _models ) {
                    var models = [];

                    if ( !err ) {
                        _models.forEach(function( model ) {
                            models.push( new that( model ) );
                        });

                        resolve( models );
                    } else {
                        reject( err );
                    }
                }
            );
        });
    }
},
/* @Prototype */
{
    setup: function( model ) {
        this._model = model;
    },

    map: function() {
        return this._model.map.apply( this, arguments );
    }
});