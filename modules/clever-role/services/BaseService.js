var Class = require( 'uberclass' )
  , Q = require( 'q' );

module.exports = Class.extend( {
    instance: null,
    Model: null
}, {
    db: null,

    setup: function ( dbAdapter ) {
        this.db = dbAdapter;
    },

    startTransaction: function () {
        return this.db.startTransaction();
    },

    query: function ( sql ) {
        console.log( 'Running SQL: ' + sql );
        return this.db.query( sql, null, { raw: true } );
    },

    findById: function ( id ) {
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.find( id ).success( deferred.resolve ).error( deferred.reject );
            } else {
                this.Class.Model.findById( id, function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            if ( err.name == "CastError" && err.path === "_id" ) {
                                deferred.resolve( null );
                            } else {
                                deferred.reject( err );
                            }
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }
        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided' );
            } );
        }

        return deferred.promise;
    },

    findAll: function ( options ) {
        options = options || {};
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.findAll().success( deferred.resolve ).error( deferred.reject );
            } else {
                this.Class.Model.find( function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            deferred.reject();
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }

        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    },

    find: function ( options ) {
        options = options || {};
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.findAll( options ).success( deferred.resolve ).error( deferred.reject );
            } else {
                this.Class.Model.find( options, function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            deferred.reject();
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }
        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    },

    findExtended: function ( conditions, fields, options ) {
        var deferred = Q.defer();

        conditions = conditions || {},
            fields = fields || null,
            options = options || {};

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                console.warn( 'options & fields not supported yet for findExtended ORM branch' );
                this.Class.Model.findAll( conditions ).success( deferred.resolve ).error( deferred.reject );
            } else {
                this.Class.Model.find( conditions, fields, options, function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            deferred.reject();
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }
        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    },

    findOrCreate: function ( options ) {
        options = options || {};
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.findOrCreate( options ).success( deferred.resolve ).error( deferred.reject );
            } else {
                this.Class.Model.findOrCreate( options, function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            deferred.reject();
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }
        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    },

    create: function ( data ) {
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.create( data )
                    .success( deferred.resolve )
                    .error( deferred.reject );
            } else {
                new this.Class.Model( data ).save( function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            deferred.reject();
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }

        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    },

    update: function ( id, data ) {
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.find( id )
                    .success( function ( model ) {
                        if ( model ) {
                            model.updateAttributes( data )
                                .success( deferred.resolve )
                                .error( deferred.reject );
                        } else {
                            deferred.reject( 'Model not found.' );
                        }
                    } )
                    .error( deferred.reject );
            } else {
                this.Class.Model.findOneAndUpdate( (id.toString().match( /object Object/ ) !== null ? id : {_id: id}), data, function ( err, result ) {
                    if ( err ) {
                        if ( err.name == "CastError" && err.path === "_id" ) {
                            deferred.resolve( null );
                        } else {
                            deferred.reject( err );
                        }
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }
        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    },

    destroy: function ( id ) {
        var deferred = Q.defer();

        if ( this.Class.Model !== null ) {
            if ( this.Class.Model.ORM ) {
                this.Class.Model.find( id )
                    .success( function ( model ) {
                        if ( model ) {
                            model.destroy()
                                .success( deferred.resolve )
                                .error( deferred.reject );
                        } else {
                            deferred.reject( 'Model not found.' );
                        }
                    } )
                    .error( deferred.reject );
            } else {
                this.Class.Model.findById( id ).model.remove( {_id: id}, function ( err, result ) {
                    if ( err ) {
                        process.nextTick( function () {
                            deferred.reject();
                        } );
                    } else {
                        process.nextTick( function () {
                            deferred.resolve( result );
                        } );
                    }
                } );
            }
        } else {
            process.nextTick( function () {
                deferred.reject( 'Function not defined and no Model provided.' );
            } );
        }

        return deferred.promise;
    }
} );
