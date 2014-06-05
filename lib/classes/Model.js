var Class = require( 'uberclass' )
  , debug = require( 'debug' )( 'Models' )
  , moduleLoader = injector.getInstance( 'moduleLoader' )
  , Promise = require( 'bluebird' )
  , async = require( 'async' )
  , models = {};

module.exports = Class.extend(
/* @Static */
{
    getDefinedModels: function() {
        return models;
    },

    softDeletable: false,

    versionable: false,

    timeStampable: true,

    type: 'ORM',

    extend: function() {
        if ( models[ arguments[ 0 ] ] !== undefined ) {
            return models[ arguments[ 0 ] ];
        }

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
          , driver = null
          , model = null;

        debug( [ 'Defining the', modelName, '(' + modelType + ')', 'model...' ].join( ' ' ) );

        // Add the name into the Static
        Static.name = modelName;

        // Check to see if the module we need is enabled!
        if ( moduleLoader.moduleIsEnabled( moduleName ) !== true ) {
            throw new Error( [ 'To use type', modelType, 'on your', modelName, 'model you need to enable the', moduleName, 'module!' ].join( ' ' ) );
        } else {
            Static._driver = driver = injector.getInstance( modelType.toLowerCase() === 'orm' ? 'cleverOrm' : 'cleverOdm' );
        }

        // Move the getters from the proto if we have them
        if ( Proto.getters !== undefined ) {
            Static._getters = Proto.getters;
            delete Proto.getters;
        }

        // Move the setters from the proto if we have them
        if ( Proto.setters !== undefined ) {
            Static._setters = Proto.setters;
            delete Proto.setters;
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
        }

        // Parse the _schema into an actual model we can use
        Static._model = driver.parseModelSchema( Static, Proto );

        // Call extend on the parent
        model = this._super.apply( this, extendingArgs );

        // Keep track of it so we don't redefine the model again
        models[ modelName ] = model;

        // Return the fully built model
        return model;
    },

    getSchemaFromProto: function( Proto, Static, key ) {
        var prop = Proto[ key ];

        if ( prop === Date || prop === String || prop instanceof String || prop === Number || prop === Boolean || ( typeof prop === 'object' ) ) {
            if ( typeof Static._schema !== 'object' ) {
                Static._schema = {};
            }

            if ( typeof Static._getters !== 'object' ) {
                Static._getters = {};
            }

            if ( typeof Static._setters !== 'object' ) {
                Static._setters = {};
            }

            Static._schema[ key ] = prop;
            Static._getters[ key ] = function() {
                return this._model[ key ];
            };
            Static._setters[ key ] = function( val ) {
               this._model[ key ] = val;
            };

            delete Proto[ key ];
        }
    },

    find: function( id ) {
        var that = this
          , options = isNaN( id )
                ? id
                : {};

        if ( !!id && !isNaN( id ) ) {
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
                    }
                ],
                function( err, model ) {
                    !err ? resolve( !!model ? new that( model ) : null ) : reject( err );
                }
            );
        });
    },

    findById: function( id ) {
        return this.find( id );
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
    },

    create: function( data ) {
        var that = this;

        return new Promise( function( resolve, reject ) {
            that._model
                .create( data )
                .success( function( _model ) {
                    resolve( new that( _model ) );
                })
                .error( reject );
        });
    }
},
/* @Prototype */
{
    setup: function( model ) {
        this._model = model;
        Object.keys( this.Class._getters ).forEach( this.proxy( '_setupProperty' ) );
    },

    _setupProperty: function( propName ) {
        Object.defineProperty( this, propName, {
            get: this.proxy( this.Class._getters[ propName ] ),
            set: this.proxy( this.Class._setters[ propName ] ),
            enumerable: true
        });
    },

    _setModel: function( _model ) {
        this._model = _model;
    },

    map: function() {
        return this._model.map.apply( this, arguments );
    },

    save: function() {
        var that = this;

        return new Promise( function( resolve, reject ) {
            that._model
                .save()
                .success( function( _model ) {
                    that._setModel( _model );
                    resolve( that );
                })
                .error( reject );
        });
    },

    destroy: function() {
        var that = this;

        return new Promise( function( resolve, reject ) {
            that._model
                .destroy()
                .success( function( _model ) {
                    delete that._model;
                    resolve();
                })
                .error( reject );
        });
    },
});