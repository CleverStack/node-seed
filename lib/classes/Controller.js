var Controller = require( 'clever-controller' )
  , EventEmitter = require( 'events' ).EventEmitter
  , uberUtil = require( 'utils' ).uberUtil;

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
            this.Class
                .service
                .findAll( this.req.query )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    getAction: function() {
        if ( this.Class.service !== null ) {
            this.Class
                .service
                .find( this.req.params.id )
                .then( this.proxy( 'handleServiceMessage' ) )
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
            this.Class
                .service
                .update( this.req.params.id, this.req.body )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    deleteAction: function() {
        if ( this.Class.service !== null ) {
            this.Class
                .service
                .destroy( this.req.params.id )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    handleServiceMessage: function( obj ) {
        if ( obj.statuscode ) {
            this.send( obj.message, obj.statuscode );
            return;
        }

        this.send( obj, 200 );
    }
});