var injector    = require( 'injector' )
  , exceptions  = require( 'exceptions' )
  , Class       = injector.getInstance( 'Class' )
  , Promise     = require( 'bluebird' )
  , path        = require( 'path' )
  , util        = require( 'util' )
  , debug       = require( 'debug' )( 'Services' )
  , Model       = injector.getInstance( 'Model' )
  , services    = {}
  , Service;

Service = exports.Class = Class.extend(
/** @Static **/
{
    model: null,

    db: null
},
/** @Prototype */
{
    db: false,

    model: false,

    // Currently only supports Sequelize
    // @TODO this needs a serious refactor
    query: function( query, raw ) {
        raw = raw || false;
        this.db.query( sql, null, { raw: raw } );
    },

    // Create a new model
    create: function( data ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( new Error( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.create()' ) );
                return;
            }

            if ( !!data.id ) {
                reject( new exceptions.DuplicateModel( 'Unable to create a new ' + service.model._name + ', identity already exists.' ) );
            }

            service.model
                .create( data )
                .then( resolve )
                .catch( reject );
        });
    },

    // Find one record using either id or a where {}
    find: function( idOrWhere ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            if ( typeof idOrWhere === 'object' && service.model.type === 'ORM' ) {
                Object.keys( idOrWhere.where ).forEach( function( name ) {
                    if ( idOrWhere.where[ name ] === 'null' ) { 
                        idOrWhere.where[ name ] = null;
                    }
                });
            }

            service.model
                .find( idOrWhere )
                .then( function( model ) {
                    if ( model !== null && !!model && !!model.id ) {
                        resolve( model );
                    } else {
                        reject( new exceptions.ModelNotFound( service.model._name + " doesn't exist." ) );
                    }
                })
                .catch( reject );

        });
    },

    findOrCreate: function( idOrWhere, data ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            if ( typeof idOrWhere === 'object' && typeof idOrWhere.where === 'object' && service.model.type === 'ORM' ) {
                Object.keys( idOrWhere.where ).forEach( function( name ) {
                    if ( idOrWhere.where[ name ] === 'null' ) { 
                        idOrWhere.where[ name ] = null;
                    }
                });
            }

            service.model
                .findOrCreate( idOrWhere, data )
                .then( resolve )
                .catch( reject );
        });
    },

    // Find more than one record using using a where {}
    findAll: function( idOrWhere ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            if ( typeof idOrWhere === 'object' && service.model.type === 'ORM' ) {
                Object.keys( idOrWhere.where ).forEach( function( name ) {
                    if ( idOrWhere.where[ name ] === 'null' ) { 
                        idOrWhere.where[ name ] = null;
                    }
                });
            }

            service.model
                .findAll( idOrWhere )
                .then( resolve )
                .catch( reject );
        });
    },

    // Find one record and update it using either id or a where {}
    update: function( idOrWhere, data ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            if ( !idOrWhere || idOrWhere === null ) {
                reject( new exceptions.ModelNotFound ( 'Unable to update ' + service.model._name + ', unable to determine identity.' ) );
            }

            if ( !data ) {
                reject( new exceptions.InvalidData( 'Unable to update ' + service.model._name + ', you did not provide any data.' ) );
            }

            service.model
                .find( idOrWhere )
                .then( function( user ) {
                    if ( !!user && !!user.id ) {

                        Object.keys( data ).forEach(function( i ) {
                            user[ i ] = data[ i ];
                        });

                        user.save()
                            .then( resolve )
                            .catch( reject );

                    } else {
                        reject( new exceptions.ModelNotFound( service.model._name + " doesn't exist." ) );
                    }
                })
                .catch( reject );

        });
    },

    // Find one record and delete it using either id or a where {}
    destroy: function( idOrWhere ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            if ( !idOrWhere || idOrWhere === null ) {
                reject( new exceptions.ModelNotFound( 'Unable to delete ' + service.model._name + ', unable to determine identity.' ) );
            }

            service.model
                .find( idOrWhere )
                .then( function( model ) {
                    if ( !!model && !!model.id ) {
                        model.destroy()
                            .then( resolve )
                            .catch( reject )
                    } else {
                        reject( new exceptions.ModelNotFound( service.model._name + " doesn't exist." ) );
                    }
                })
                .catch( reject );

        });
    }
});

exports.extend = function() {
    var extendingArgs = [].slice.call( arguments )
      , serviceName = ( typeof extendingArgs[ 0 ] === 'string' )
            ? extendingArgs.shift()
            : false
      , Static = ( extendingArgs.length === 2 )
            ? extendingArgs.shift()
            : {}
      , Proto = extendingArgs.shift();
    
    if ( !serviceName ) {
        var Reg   = new RegExp( '.*\\(([^\\)]+)\\:.*\\:.*\\)', 'ig' )
          , stack = new Error().stack.split( '\n' )
          , file  = stack.splice( 2, 1 );

        if ( Reg.test( file ) ) {
            serviceName = RegExp.$1.split( path.sep ).pop().replace( '.js', '' );
        } else {
            throw new Error( 'Unable to determine services location and name.' );
        }
    }

    if ( services[ serviceName ] !== undefined ) {
        debug( 'Returning previously defined service ' + serviceName + '...' );
        return services[ serviceName ];
    }

    debug( 'Setting up ' + serviceName + '...' );

    Proto._name = Static._name = serviceName;

    if ( !!Proto.model ) {
        if ( Proto.model.extend === Model.extend ) {
            debug( 'Using the ' + Proto.model._name + ' model for default (restful) CRUD on this service...' );

            Proto.db = Proto.model._db;
            Static.db = Proto.db;
            Static.model = Proto.model;

        } else {
            debug( util.inspect( Proto ) );
            throw new Error( 'Unknown model type passed to Service.extend(), set environment variable DEBUG=Services for more information.' );
        }
    } else if ( !!Proto.db ) {
        debug( 'Setting db adapter for service...' );
        Static.db = Proto.db;
    }

    debug( 'Creating service class...' );
    var Klass = Service.callback( 'extend' )( Static, Proto )
      , instance = Klass.callback( 'newInstance' )();

    services[ serviceName ] = instance;

    return instance;
}

exports.getDefinedServices = function() {
    return services;
}