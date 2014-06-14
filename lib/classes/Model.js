var injector    = require( 'injector' )
  , Class       = injector.getInstance( 'Class' )
  , Promise     = require( 'bluebird' )
  , async       = require( 'async' )
  , util        = require( 'util' )
  , debuggr     = require( 'debug' )( 'Models' )
  , moduleLdr   = injector.getInstance( 'moduleLoader' )
  , models      = {};

module.exports = Class.extend(
/* @Static */
{   
    // Either 'ORM' or 'ODM'
    type: 'ORM',

    // Get the model cache
    getDefinedModels: function() {
        return models;
    },

    // Behaviours you can use on models you define
    softDeletable: false,
    versionable: false,
    timeStampable: true,

    Types: {
        ENUM: function() {
            return {
                type: this.ENUM,
                values: [].slice.call( arguments ),
                toString: function() {
                    return this.type;
                }
            }
        }
    },

    // The function you call to create a new model
    extend: function() {
        var extendingArgs = [].slice.call( arguments )
          , modelName = ( typeof extendingArgs[ 0 ] === 'string' ) ? extendingArgs.shift() : false
          , Static = ( extendingArgs.length === 2 ) ? extendingArgs.shift() : {}
          , Proto = extendingArgs.shift()
          , modelType = Static.type !== undefined ? Static.type : this.type
          , moduleName = 'clever-' + modelType.toLowerCase()
          , driver = null
          , model = null
          , debug = null;

        extendingArgs = [ Static, Proto ];

        if ( !modelName ) {
            var Reg = new RegExp( '\\)?.*\\(([^\\[\\:]+).*\\)', 'ig' )
              , stack = new Error().stack.split( '\n' )
              , file = stack.splice( 2, 1 );

            if ( Reg.test( file ) ) {
                modelName = RegExp.$1.split( path.sep ).pop().replace( '.js', '' );
            } else {
                throw new Error( 'Unable to determine model name.' );
            }
        }

        debug = function( msg ) {
            debuggr( modelName + 'Model: ' + msg );
        };

        if ( models[ modelName ] !== undefined ) {
            debuggr( modelName + 'Model: Returning model class from the cache...' );
            return models[ modelName ];
        }

        debuggr( [ modelName + 'Model: Defining model using', modelType, 'type...' ].join( ' ' ) );

        Static._name = modelName;
        Static.type = modelType;

        debuggr( modelName + 'Model: Checking to see if the driver is installed and enabled...' );
        if ( moduleLdr.moduleIsEnabled( moduleName ) !== true ) {
            throw new Error( [ 'To use type', modelType, 'on your', modelName, 'model you need to enable the', moduleName, 'module!' ].join( ' ' ) );
        } else {
            Static._driver = driver = injector.getInstance( modelType.toLowerCase() === 'orm' ? 'cleverOrm' : 'cleverOdm' );
        }

        debug( 'Defining models this.debug() helper...' );
        Proto.debug = Static.debug = function( msg ) {
            driver.debug( modelName + 'Model: ' + msg );
        };

        debug( 'Checking for defined getters and setters...' );

        if ( Proto.getters !== undefined ) {
            Static._getters = Proto.getters;
            delete Proto.getters;
        }

        if ( Proto.setters !== undefined ) {
            Static._setters = Proto.setters;
            delete Proto.setters;
        }

        debug( 'Defining schema...' );
        Object.keys( Proto ).forEach( this.callback( 'getSchemaFromProto', Proto, Static ) );

        debug( 'Setting up behaviours...' );
        [ 'softDeletable', 'versionable', 'timeStampable' ].forEach(function( behaviour ) {

            Static[ behaviour ] = Static[ behaviour ] !== undefined ? Static[ behaviour ] : this[ behaviour ];

        }.bind( this ));

        // Add the accessedAt field if we are timeStampable
        if ( Static.timeStampable === true ) {
            debug( 'Defining timeStampable behaviour schema fields...' );

            Static._schema.createdAt = Date;
            Static._schema.updatedAt = Date;
        }

        // Add the deletedAt field if we are softDeletable
        if ( !!Static.softDeletable ) {
            debug( 'Defining softDeletable behaviour schema fields...' );

            if ( modelType.toLowerCase() === 'odm' ) {
                Static._schema.deletedAt = {
                    type: Date,
                    default: null
                };
            }
        }

        debug( 'Generating native model using driver.parseModelSchema()...' );
        Static._model = driver.parseModelSchema( Static, Proto );

        debug( 'Creating model class...' );
        model = this._super.apply( this, extendingArgs );

        models[ modelName ] = model;
        return model;
    },

    // Private function used to build _schema so it can be passed to the _driver for schema creation
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
                if ( key === 'id' && Static.type.toLowerCase() === 'odm' ) {
                    return this._model._id;
                } else {
                    return this._model[ key ];
                }
            };
            Static._setters[ key ] = function( val ) {
                this._model[ key ] = val;
            };

            delete Proto[ key ];
        }
    },

    find: function( id ) {
        var modelType = this.type.toUpperCase ? this.type.toUpperCase() : this.type
          , isModel = !!this._model && this._model !== null
          , that = this
          , options = !/^[0-9a-fA-F]{24}$/.test( id ) && isNaN( id ) ? id : {};

        return new Promise(function( resolve, reject ) {

            // Configure options
            if ( !!id && ( /^[0-9a-fA-F]{24}$/.test( id ) || !isNaN( id ) ) ) {
                if ( modelType === 'ODM' ) {
                    try {
                        options._id = that._driver.mongoose.Types.ObjectId.fromString( id );
                    } catch( err ) {
                        resolve( null );
                        return;
                    }
                } else {
                    options.id = id;
                }
            }

            // Make sure we have either an id or options to find by models with
            if ( !!isModel && !id && !options ) {
                reject( [ 'You must specify either an id or an object containing fields to find a', that._name ].join( ' ' ) );
                return;
            }

            async.waterfall(
                [
                    function validateModel( callback ) {
                        callback( !!isModel ? null : 'You cannot call Model.find() directly on the model class.' );
                    },

                    function softDeletable( callback ) {
                        if ( !!that.softDeletable ) {
                            options.deletedAt = null;
                        }
                        callback( null );
                    },

                    function findModel( callback ) {
                        that.debug( 'find(' + ( typeof options === 'object' ? JSON.stringify( options ) : options ) + ')' );

                        if ( modelType === 'ORM' ) {

                            that._model
                                .find( { where: options } )
                                .success( that.callback( callback, null ) )
                                .error( callback );

                        } else if ( modelType === 'ODM' ) {

                            that._model.findOne( options, callback );

                        } else {

                            callback( 'Unsupported Model Type(' + modelType + ')' );
                            
                        }
                    }
                ],
                function returnFoundModel( err, _model ) {
                    if ( !err ) {
                        resolve( !!_model && _model !== null ? new that( _model ) : null );
                    } else {
                        reject( [ 'Unable to find the', that._name, 'model because of', err ].join( ' ' ) );
                    }
                }
            );
        });
    },

    findById: function( id ) {
        return this.find( id );
    },

    findOne: function( id ) {
        return this.find( id );
    },

    findAll: function( options ) {
        var modelType = this.type.toUpperCase ? this.type.toUpperCase() : this.type
          , isModel = !!this._model && this._model !== null
          , that = this;

        return new Promise(function( resolve, reject ) {
            async.waterfall(
                [
                    function validateModel( callback ) {
                        callback( !!isModel ? null : 'You cannot call Model.findAll() directly on the model class.' );
                    },

                    function softDeletable( callback ) {
                        if ( !!that.softDeletable ) {
                            options.deletedAt = null;
                        }
                        callback( null );
                    },

                    function findModels( callback ) {
                        that.debug( 'findAll(' + ( typeof options === 'object' ? JSON.stringify( options ) : options ) + ')' );

                        if ( modelType === 'ORM' ) {

                            that._model
                                .findAll( { where: options } )
                                .success( that.callback( callback, null ) )
                                .error( callback );

                        } else if ( modelType === 'ODM' ) {

                            that._model.find( options, callback );

                        } else {

                            callback( 'Unsupported Model Type(' + modelType + ')' );
                            
                        }
                    }
                ],
                function returnFoundModels( err, _models ) {
                    var models = [];
                    
                    _models = _models instanceof Array ? _models : [ _models ];

                    if ( !err ) {
                        _models.forEach(function( model ) {
                            if ( model !== null ) {
                                models.push( new that( model ) );
                            }
                        });

                        resolve( models );
                    } else {
                        reject( [ 'Unable to find any', that._name, 'models because of', err ].join( ' ' ) );
                    }
                }
            );
        });
    },

    create: function( data ) {
        var modelType = this.type.toUpperCase ? this.type.toUpperCase() : this.type
          , isModel = !!this._model && this._model !== null
          , that = this;

        return new Promise(function( resolve, reject ) {
            async.waterfall(
                [
                    function validateModel( callback ) {
                        callback( !!isModel ? null : 'You cannot call Model.create() directly on the model class.' );
                    },

                    function hasValidData( callback ) {
                        if ( !!data && !data.id && Object.keys( data ).length ) {
                            callback( null );
                        } else {
                            reject( 'Invalid data provided to Model.create(' + util.inspect( data ) + ')' );
                        }
                    },

                    function timeStampable( callback ) {
                        if ( modelType === 'ODM' && !!that.timeStampable ) {
                            data.createdAt = Date.now();
                            data.updatedAt = Date.now();
                        }
                        callback( null );
                    },
                    
                    function createModel( callback ) {
                        that.debug( 'create(' + JSON.stringify( data ) + ')' );

                        if ( modelType === 'ORM' ) {

                            that._model
                                .create( data )
                                .success( that.callback( callback, null ) )
                                .error( callback )

                        } else if ( modelType === 'ODM' ) {
                            
                            that._model.create( data, callback );

                        } else {

                            callback( 'Unsupported Model Type(' + modelType + ')' );

                        }
                    }
                ],
                function returnCreatedModel( err, _model ) {
                    if ( !err ) {
                        resolve( new that( _model instanceof Array ? _model[ 0 ] : _model ) );
                    } else {
                        reject( [ 'Unable to create', that._name, 'because of', err ].join( ' ' ) );
                    }
                }
            );
        });
    }
},
/* @Prototype */
{
    _model: null,

    setup: function( model ) {
        this._setModel( model );
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

        this.debug( 'save(' + JSON.stringify( this ) + ')' );

        return new Promise( function( resolve, reject ) {
            if ( that.Class.type.toLowerCase() === 'orm' ) {

                that._model
                    .save()
                    .success( function( _model ) {
                        that._setModel( _model );
                        resolve( that );
                    })
                    .error( reject )

            } else if ( that.Class.type.toLowerCase() === 'odm' ) {
                
                if ( !!that.Class.timeStampable ) {
                    that._model.updatedAt = Date.now();
                }

                that._model
                    .save( function( err, _model ) {
                        if ( !err ) {
                            that._setModel( _model );
                            resolve( that );
                        } else {
                            reject( err );
                        }
                    });

            } else {
                reject( 'Unsupported Model Type' );
            }
        });
    },

    destroy: function() {
        var that = this;

        this.debug( 'destroy(' + JSON.stringify( this ) + ')' );

        return new Promise( function( resolve, reject ) {
            if ( that.Class.type.toLowerCase() === 'orm' ) {

                that._model
                    .destroy()
                    .success( function() {
                        delete that._model;
                        resolve( {} );
                    })
                    .error( reject )

            } else if ( that.Class.type.toLowerCase() === 'odm' ) {

                if ( !!that.Class.softDeletable ) {
                    // Perform softDelete
                    that._model.deletedAt = Date.now();
                    that._model
                        .save( function( err ) {
                            if ( !err ) {
                                delete that._model;
                                resolve( {} );
                            } else {
                                reject( err );
                            }
                        });

                } else {
                    that._model.remove(function( err ) {
                        if ( !err ) {
                            delete that._model;
                            resolve( {} );
                        } else {
                            reject( err );
                        }
                    });
                }

            } else {
                reject( 'Unsupported Model Type' );
            }
        });
    },

    toJSON: function() {
        var that = this
          , json;

        if ( this.Class.type === 'ORM' ) {
            json = this._model.values;
        } else {
            json = this._model.toObject();

            // Add in the id if we have it defined
            if ( !!json._id ) {
                json.id = json._id;
                delete json._id;
            }
        }

        // Add in getters
        Object.keys( this.Class._getters ).forEach( function( getterName ) {
            if ( json[ getterName ] === undefined ) {
                json[ getterName ] = that[ getterName ];
            }
        });

        return json;
    }
});