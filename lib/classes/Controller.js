var Controller      = require( 'clever-controller' )
  , Exceptions      = require( 'exceptions' )
  , models          = require( 'models' )
  , injector        = require( 'injector' )
  , _               = require( 'underscore' );

module.exports = Controller.extend(
/* @Static */
{
    app         : injector.getInstance( 'app' ),
    service     : null
},
/* @Prototype */
{
    listAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var query       = this.req.query
              , options     = { where: _.omit( query, '_include' ) }
              , includes    = query._include || false;

            if ( !!includes ) {
                options.include = [];
                includes.split( ',' ).forEach( function( include ) {
                    include = include.split( '|' );
                    var queryInclude = { model: models[ include[ 0 ] ] };
                    if ( include.length > 1 ) {
                        queryInclude.as = include[ 1 ];
                    }
                    options.include.push( queryInclude );
                });
            }

            return this.Class
                .service
                .findAll( options )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
        } else {
            this.next();
        }
    },

    getAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var query       = this.req.query
              , options     = { where: _.omit( query, '_include' ) }
              , includes    = query._include || false;

            if ( !!includes ) {
                options.include = [];
                includes.split( ',' ).forEach( function( include ) {
                    include = include.split( '|' );
                    var queryInclude = { model: models[ include[ 0 ] ] };
                    if ( include.length > 1 ) {
                        queryInclude.as = include[ 1 ];
                    }
                    options.include.push( queryInclude );
                });
            }

            options.where.id = this.req.params.id || this.req.query.id;

            if ( typeof options.where.id === 'undefined' ) {
                return this.listAction.apply( this, arguments );
            }

            return this.Class
                .service
                .find( options )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
        } else {
            this.next();
        }
    },

    postAction: function() {
        if ( !!this.req.body.id || !!this.req.params.id ) {
            this.action = 'putAction';
            if ( !this.req.params.id ) {
                this.req.params.id = this.req.body.id;
                delete this.req.body.id;
            }
            return this.putAction();
        } else if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var query       = this.req.query
              , options     = { where: _.omit( query, '_include' ) }
              , includes    = query._include || false;

            if ( !!includes ) {
                options.include = [];
                includes.split( ',' ).forEach( function( include ) {
                    include = include.split( '|' );
                    var queryInclude = { model: models[ include[ 0 ] ] };
                    if ( include.length > 1 ) {
                        queryInclude.as = include[ 1 ];
                    }
                    options.include.push( queryInclude );
                });
            }

            return this.Class
                .service
                .create( this.req.body, options )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
        } else {
            this.next();
        }
    },

    putAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var query       = this.req.query
              , options     = { where: _.omit( query, '_include' ) }
              , includes    = query._include || false;

            if ( !!includes ) {
                options.include = [];
                includes.split( ',' ).forEach( function( include ) {
                    include = include.split( '|' );
                    var queryInclude = { model: models[ include[ 0 ] ] };
                    if ( include.length > 1 ) {
                        queryInclude.as = include[ 1 ];
                    }
                    options.include.push( queryInclude );
                });
            }

            options.where.id = this.req.params.id || this.req.query.id;

            return this.Class
                .service
                .update( options, this.req.body )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
        } else {
            this.next();
        }
    },

    deleteAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var query       = this.req.query
              , options     = { where: _.omit( query, '_include' ) }
              , includes    = query._include || false;

            if ( !!includes ) {
                options.include = [];
                includes.split( ',' ).forEach( function( include ) {
                    include = include.split( '|' );
                    var queryInclude = { model: models[ include[ 0 ] ] };
                    if ( include.length > 1 ) {
                        queryInclude.as = include[ 1 ];
                    }
                    options.include.push( queryInclude );
                });
            }

            options.where.id = this.req.params.id || this.req.query.id;

            return this.Class
                .service
                .destroy( options )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
        } else {
            this.next();
        }
    },

    handleServiceMessage: function( obj ) {
        if ( obj.statusCode ) {
            this.send( obj.message, obj.statusCode );
        } else if ( obj instanceof Exceptions.DuplicateModel || obj instanceof Exceptions.InvalidData || obj instanceof Exceptions.ModelValidation ) {
            this.send( { statusCode: 400, message: obj.message }, 400 );
        } else if ( obj instanceof Exceptions.ModelNotFound ) {
            this.send( { statusCode: 404, message: obj.message }, 404 );
        } else if ( obj instanceof Error ) {
            this.send( { statusCode: 500, message: obj.message, stack: obj.stack ? obj.stack.split('\n') : obj.stack }, 500 );
        } else {
            this.send( obj, 200 );
        }
    }
});