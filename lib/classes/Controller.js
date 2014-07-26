var Controller      = require( 'clever-controller' )
  , EventEmitter    = require( 'events' ).EventEmitter
  , uberUtil        = require( 'utils' ).uberUtil
  , models          = require( 'models' );

module.exports = Controller.extend(
/* @Static */
{
    app: require( 'injector' ).getInstance( 'app' ),
    service: null
},
/* @Prototype */
{
    listAction: function() {
        if ( this.Class.service !== null ) {
            var options = { where: this.req.query };

            if ( !!options.where._include ) {
                options.where._include.split( ',' ).forEach( function( include ) {
                    if ( typeof options.include === 'undefined' ) {
                        options.include = [];
                    }
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            this.Class
                .service
                .findAll( options )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    getAction: function() {
        if ( this.Class.service !== null ) {
            var options = { where: this.req.query };

            options.where.id = this.req.params.id || this.req.query.id;

            if ( !!options.where._include ) {
                options.include = options.include || [];
                options._include.split( ',' ).forEach( function( include ) {
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            if ( typeof options.where.id === 'undefined' ) {
                return this.listAction.apply( this, arguments );
            }

            this.Class
                .service
                .find( options )
                .then( this.proxy( function( model ) {
                    if ( model === null || !!model.statusCode ) {
                        this.send({
                            statusCode: model.statusCode || 404,
                            message: model.message || this.Class.service.model._name + ' doesn\'t exist.'
                        }, model.statusCode || 404 );
                    } else {
                        this.send( model, 200 );
                    }
                }))
                .catch( this.proxy( 'handleException' ) );
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
        } else if ( this.Class.service !== null ) {
            this.Class
                .service
                .create( this.req.body )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    putAction: function() {
        if ( this.Class.service !== null ) {
            var options = { where: this.req.query };

            options.where.id = this.req.params.id || this.req.query.id;

            if ( !!options.where._include ) {
                options.include = options.include || [];
                options._include.split( ',' ).forEach( function( include ) {
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            this.Class
                .service
                .update( options, this.req.body )
                .then( this.proxy( function( model ) {
                    if ( model === null || !!model.statusCode ) {
                        this.send({
                            statusCode: model.statusCode || 404,
                            message: model.message || this.Class.service.model._name + ' doesn\'t exist.'
                        }, model.statusCode || 404 );
                    } else {
                        this.send( model, 200 );
                    }
                }))
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    deleteAction: function() {
        if ( this.Class.service !== null ) {
            var options = { where: this.req.query };

            options.where.id = this.req.params.id || this.req.query.id;

            if ( !!options.where._include ) {
                options.include = options.include || [];
                options._include.split( ',' ).forEach( function( include ) {
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            this.Class
                .service
                .destroy( options )
                .then( this.proxy( function( model ) {
                    if ( model === null || !!model.statusCode ) {
                        this.send({
                            statusCode: model.statusCode || 404,
                            message: model.message || this.Class.service.model._name + ' doesn\'t exist.'
                        }, model.statusCode || 404 );
                    } else {
                        this.send( model, 200 );
                    }
                }))
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    handleServiceMessage: function( obj ) {
        if ( obj.statusCode ) {
            this.send( obj.message, obj.statusCode );
            return;
        }

        this.send( obj, 200 );
    }
});