module.exports = function ( EmailService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: null
        },
        /* @Prototype */
        {

            listAction: function () {
                var userId = this.req.user.id;

                EmailService
                    .listEmails( userId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            getAction: function () {
                var userId = this.req.user.id
                  , emailId = this.req.params.id;

                EmailService
                    .getEmailByIds( userId, emailId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            postAction: function () {
                var userId = this.req.user.id
                  , accId = this.req.user.account.id
                  , accLogo = this.req.user.account.logo
                  , accName = this.req.user.account.name
                  , userFirstName = this.req.user.firstname
                  , userLastName = this.req.user.lastname
                  , data = this.req.body;

                data = data.map( function ( x ) {
                    x.userId = userId;
                    x.accId = accId;
                    x.userFirstName = userFirstName;
                    x.userLastName = userLastName;
                    x.accLogo = accLogo;
                    x.accName = accName;
                    return x;
                } );

                EmailService
                    .handleEmailCreation( data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            putAction: function () {
                this.send( 'invalid', 403 );
            },

            deleteAction: function () {
                var userId = this.req.user.id
                  , emailId = this.req.params.id;

                EmailService
                    .deleteEmail( userId, emailId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            sendAction: function () {
                var userId = this.req.user.id
                  , emailId = this.req.params.id
                  , type = this.req.body.type;

                EmailService
                    .handleEmailSending( userId, emailId, type )
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
};