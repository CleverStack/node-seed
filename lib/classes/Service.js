var Class       = require( 'uberclass' )
  , Promise     = require( 'bluebird' )
  , path        = require( 'path' )
  , util        = require( 'util' )
  , injector    = require( 'injector' )
  , debug       = require( 'debug' )( 'Services' )
  , Model       = injector.getInstance( 'Model' )
  , services    = [];

module.exports = Class.extend(
/** @Static **/
{
    model: null,

    db: null,

    getDefinedServices: function() {
        return services;
    },

    extend: function() {
        var Reg = new RegExp( '\\)?.*\\(([^\\[\\:]+).*\\)', 'ig' )
          , stack = new Error().stack.split( '\n' );

        // Get rid of the Error at the start
        stack.shift();

        // Use regular expression to get the name of this service
        if ( Reg.test( stack[ 2 ] ) ) {
            var serviceName = RegExp.$1.split( path.sep ).pop().replace( '.js', '' );
        } else {
            throw new Error( 'Unable to determine services location and name.' );
        }

        var extendingArgs = [].slice.call( arguments )
          , Static = ( extendingArgs.length === 2 )
                ? extendingArgs.shift()
                : {}
          , Proto = extendingArgs.shift()
          , extendingArgs = [ Static, Proto ];

        if ( services[ serviceName ] !== undefined ) {
            debug( 'Returning previously defined service ' + serviceName + '...' );
            return services[ serviceName ];
        }

        debug( 'Setting up ' + serviceName + '...' );

        // Set the name of this service
        Proto._name = Static._name = serviceName;

        if ( Static.extend ) {
            debug( 'You cannot override the extend() function provided by the CleverStack Module Class!' );
            delete Static.extend;
        }

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
        var service = this._super.apply( this, extendingArgs );

        debug( 'Creating instance of service class...' );
        var instance = new service();

        debug( 'Caching...' );
        services[ serviceName ] = instance;

        debug( 'Completed.' );
        return instance;
    }
},
/** @Prototype */
{
    db: false,

    model: false,

    // Currently only supports Sequelize
    query: function( query ) {
        this.db.query( sql, null, { raw: true } );
    },

    // Create a new model
    create: function( data ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            if ( !!data.id ) {
                resolve( { statuscode: 400, message: 'Unable to create a new ' + service.model._name + ', identity already exists.' }  );
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

            service.model
                .find( idOrWhere )

                .then( function( model ) {
                    if ( !!model && !!model.id ) {
                        resolve( model );
                    } else {
                        resolve( { statuscode: 403, message: service.model._name + " doesn't exist." }  );
                    }
                })
                .catch( reject );

        });
    },

    // Find more than one record using using a where {}
    findAll: function( where ) {
        var service = this;

        return new Promise( function( resolve, reject ) {
            if ( !service.model ) {
                reject( 'Model not found, either set ' + service._name + '.model or implement ' + service._name + '.find()' );
                return;
            }

            service.model
                .findAll( where )
                .then( function( models ) {
                    resolve( models );
                })
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
                resolve( { statuscode: 400, message: 'Unable to update ' + service.model._name + ', unable to determine identity.' }  );
            }

            service.model
                .find( idOrWhere )
                .then( function( user ) {
                    if ( !!user && !!user.id ) {

                        data.forEach(function( i ) {
                            user[ i ] = data[ i ];
                        });

                        user.save()
                            .then( resolve )
                            .catch( reject );

                    } else {
                        resolve( { statuscode: 403, message: service.model._name + " doesn't exist." }  );
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
                resolve( { statuscode: 400, message: 'Unable to delete ' + service.model._name + ', unable to determine identity.' }  );
            }

            service.model
                .find( idOrWhere )
                .then( function( user ) {
                    if ( !!user && !!user.id ) {
                        user.destroy()
                            .then( resolve )
                            .catch( reject )
                    } else {
                        resolve( { statuscode: 403, message: service.model._name + " doesn't exist." }  );
                    }
                })
                .catch( reject );

        });
    }
});