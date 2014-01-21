module.exports = function ( EmailService ) {

    return (require( 'classes' ).Controller).extend( {
            service: null,

            checkEventMailData: function ( req, res, next ) {
                var data = req.body
                  , fltData = [];
                //console.log("\n *** SendGrid Event Data *** \n",data);

                var item;
                while ( item = data.pop() ) {
                    if ( ( item.event == 'open' ) && item.email_id ) {
                        fltData.push( item );
                    }
                }
                console.log( "\n\nReceived Event Notification POST from Sendgrid: " );
                req.body = fltData;
                next();
            }
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
                    .getEmailById( userId, emailId )
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
                    x['accLogo'] = accLogo;
                    x['accName'] = accName;
                    return x;
                } );

                EmailService
                    .handleEmailCreation( data )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            putAction: function () {
                this.send( 403, 'invalid' );
            },

            deleteAction: function () {
                this.send( 403, 'invalid' );
            },

            eventsMailAction: function () {
                var data = this.req.body;

                EmailService
                    .processMailEvents( data )
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