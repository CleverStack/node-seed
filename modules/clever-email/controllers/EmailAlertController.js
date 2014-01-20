var Q = require( 'q' );

module.exports = function ( RecentActivityService, AttributeKeyService, AttributeEmailAlertService, PermissionService ) {
    return (require( 'classes' ).Controller).extend( {
        service: AttributeEmailAlertService
    }, {
        listAction: function () {
            var self = this;

            AttributeEmailAlertService.list( {
                AccountId: self.req.user.AccountId
            } )
                .then( self.proxy( 'handleServiceMessage' ) )
                .fail( self.proxy( 'handleException' ) );
        },

        getAction: function () {
            if ( !this.req.params.id ) {
                return this.send( 404, 'Not found' );
            }

            AttributeEmailAlertService.get( {
                AccountId: this.req.user.AccountId,
                id: this.req.params.id
            } )
                .then( this.proxy( 'send' ) )
                .fail( this.proxy( 'handleException' ) );
        },

        postAction: function () {
            var self = this
                , data = self.req.body
                , alerts = [];

            data.alert = Array.isArray( data.alert ) ? data.alert : [data.alert];

            if ( !data.alert || !data.alert[0].alertName ) {
                return self.send( { message: 'More information is required before creating this e-mail alert.', statuscode: 400 } );
            }

            if ( !!data.alert[0]._id ) {
                return this.putAction();
            }

            AttributeEmailAlertService.saveOrUpdate( self.req.user, data.submitted, data.alert )
                .then( self.proxy( 'send' ) )
                .fail( self.proxy( 'handleException' ) );
        },

        putAction: function () {
            var self = this
                , data = self.req.body
                , alerts = [];

            data.alert = Array.isArray( data.alert ) ? data.alert : [data.alert];

            if ( !data.alert || !data.alert[0].alertName ) {
                return self.send( { message: 'More information is required before creating this e-mail alert.', statuscode: 400 } );
            }

            AttributeEmailAlertService.saveOrUpdate( self.req.user, data.submitted, data.alert )
                .then( self.proxy( 'send' ) )
                .fail( self.proxy( 'handleException' ) );
        },

        deleteAction: function () {
            var data = this.req.params;

            if ( !data.id ) {
                return this.res.send( 404, 'Not found' );
            }

            AttributeEmailAlertService.remove( this.req.user.AccountId, data.id )
                .then( this.proxy( 'handleServiceMessage' ) )
                .fail( this.proxy( 'handleException' ) );
        },

        handleServiceMessage: function ( obj ) {
            if ( obj.statuscode ) {
                this.send( obj.message, obj.statuscode );
                return;
            }

            this.send( obj, 200 );
        }
    } );
}
