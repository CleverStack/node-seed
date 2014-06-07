var Controller = require( 'clever-controller' );

module.exports = Controller.extend(
/* @Static */
{
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
                .findById( this.req.params.id )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        } else {
            this.next();
        }
    },

    postAction: function() {
        if ( this.Class.service !== null ) {
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
    }
});