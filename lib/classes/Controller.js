var Controller      = require( 'clever-controller' )
  , models          = require( 'models' )
  , exceptions      = require( 'exceptions' );

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
                options.include = options.include || [];
                options.where._include.split( ',' ).forEach( function( include ) {
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            this.Class
                .service
                .findAll( options )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
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
                options.where._include.split( ',' ).forEach( function( include ) {
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
        } else if ( this.Class.service !== null ) {
            this.Class
                .service
                .create( this.req.body )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
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
                options.where._include.split( ',' ).forEach( function( include ) {
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            this.Class
                .service
                .update( options, this.req.body )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleServiceMessage' ) );
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
                options.where._include.split( ',' ).forEach( function( include ) {
                    options.include.push( models[ include ] );
                });
                delete options.where._include;
            }

            this.Class
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
        } else if ( obj instanceof exceptions.DuplicateModel || obj instanceof exceptions.InvalidData || obj instanceof exceptions.ModelValidation ) {
            this.send( { statusCode: 400, message: obj.message }, 400 );
        } else if ( obj instanceof exceptions.ModelNotFound ) {
            this.send( { statusCode: 404, message: obj.message }, 404 );
        } else if ( obj instanceof Error ) {
            this.send( { statusCode: 500, message: obj.message, stack: obj.stack.split('\n') }, 500 );
        } else {
            this.send( obj, 200 );
        }
    }
});