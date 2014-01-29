var config = require( 'config' );

module.exports = function ( AccountService, UserService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: AccountService,

            requiresUniqueSubdomain: function ( req, res, next ) {
                var subdomain = req.body.subdomain
                  , company = req.body.company;

                if ( !company || !subdomain ) {
                    return res.json( 400, "Company name and URL are mandatory" );
                }

                AccountService
                    .find( { where: { subdomain: subdomain } } )
                    .then( function ( result ) {
                        if ( result.length ) {
                            return res.json( 403, 'This URL "' + subdomain + '" is already taken' );
                        }

                        next();
                    } )
                    .fail( function () {
                        return res.send( 500 );
                        next()
                    } )
            },

            requiresUniqueUser: function ( req, res, next ) {
                var email = req.body.email;

                UserService
                    .find( { where: { email: email } } )
                    .then( function ( result ) {

                        if ( result.length ) {
                            return res.json( 403, 'This email "' + email + '" is already taken' );
                        }

                        next();
                    } )
                    .fail( function ( err ) {
                        return res.send( 500 );
                        next();
                    } );
            },

            formatData: function ( req, res, next ) {
                var accData = req.user.account
                  , newData = {
                        name:       req.body.name       || accData.name,
                        logo:       req.body.logo       || accData.logo,
                        info:       req.body.info       || accData.info,
                        companyUrl: req.body.companyUrl || accData.companyUrl,
                        hrEmail:    req.body.hrEmail    || accData.hrEmail,
                        email:      req.body.email      || accData.email,
                        themeColor: req.body.themeColor || accData.themeColor,
                        showMap:    req.body.showMap !== undefined ? req.body.showMap : accData.showMap
                    };

                req.body = newData;
                next();
            },

            isValidEmailDomain: function ( req, res, next ) {
                var data = req.body
                  , pattern = /@(gmail|mail|yahoo|aol|aim|hotmail|facebook|cox|verizon|icloud|apple|outlook|yandex|163|126|gmx)\./i;

                if ( !data.email ) {
                    res.send( 400, 'Email is mandatory' );
                    return;
                }

                if ( pattern.test( data.email ) && (/stag|prod/gi.test( config.environmentName ) ) ) {
                    res.send( 400, 'Please register for BoltHR with your corporate email address.' );
                    return;
                }

                next();
            }

        },
        /* @Prototype */
        {
            //Private function
            listAction: function () {
                this.getAction();
                return;
            },

            //Public function
            getAction: function () {
                var accId = this.req.user.account.id;

                AccountService.find( { where: { id: accId, active: true } } )
                    .then( this.proxy( 'handleAccountRetrieval' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            handleAccountRetrieval: function ( account ) {
                var acc = ( !account || !account.length) ? {} : account[0];
                this.send( acc, 200 );
            },

            postAction: function () {
                var data = this.req.body;

                if ( data.id ) {
                    return this.putAction();
                }

                AccountService
                    .processRegistration( data )
                    .then( this.proxy( "handleDefaultOptionalJobFields" ) )
                    .fail( this.proxy( "handleException" ) );

            },

            handleDefaultOptionalJobFields: function ( ua ) {
                AccountJobFieldService
                    .seedOptionalJobFields( ua, config.optionalJobFieldNames )
                    .then( this.proxy( "handleRegistrationCode" ) )
                    .fail( this.proxy( "handleException" ) );
            },

            handleRegistrationCode: function ( ua ) {
                AccountService
                    .generateRegistrationHash( ua, config.secretKey )
                    .then( this.proxy( "handleMailVerificationCode", ua ) )
                    .fail( this.proxy( "handleException" ) );
            },

            handleMailVerificationCode: function ( ua, hash ) {
                AccountService
                    .mailRegistrationCode( ua, hash )
                    .then( this.proxy( "send", 200 ) )
                    .fail( this.proxy( "handleException" ) );
            },

            putAction: function () {
                var accId = this.req.user.account.id
                  , data = this.req.body;

                AccountService
                    .update( accId, data )
                    .then( this.proxy( "send", 200 ) )
                    .fail( this.proxy( "handleException", 200 ) );
            },

            confirmAction: function () {
                var token = this.req.body.token
                  , accountId = this.req.body.accountId;

                AccountService
                    .findById( accountId )
                    .then( this.proxy( "handleTokenConfirmation", token ) )
                    .fail( this.proxy( "handleException" ) );

            },

            handleTokenConfirmation: function ( token, account ) {

                if ( !account ) {
                    this.send( {}, 400 );
                    return;
                }

                AccountService
                    .generateRegistrationHash( account, config.secretKey )
                    .then( this.proxy( "varifyAccount", account, token ) )
                    .fail( this.proxy( "handleException" ) );

            },

            varifyAccount: function ( account, token, hash ) {
                if ( token === hash ) {

                    account
                        .updateAttributes( { active: true } )
                        .success( this.proxy( "handleSignInAfterConfirmation" ) )
                        .error( this.proxy( "handleException" ) );

                } else {
                    this.send( 'Unable to verify confirmation link', 400 );
                }
            },

            handleSignInAfterConfirmation: function ( account ) {
                var self = this;

                UserService
                    .find( {where: {AccountId: account.id}} )
                    .then( function ( users ) {
                        users[0]
                            .updateAttributes( {active: true, confirmed: true}, ['active', 'confirmed'] )
                            .success( function () {
                                UserService
                                    .getUserFullDataJson( { 'AccountId': account.id } )
                                    .then( self.proxy( "signInAfterConfirmation" ) )
                                    .fail( self.proxy( "handleException" ) )
                            } );
                    } );
            },

            signInAfterConfirmation: function ( user ) {
                this.req.login( user, this.proxy( 'createUserSession', user ) );
            },

            createUserSession: function ( user, err ) {
                if ( err ) return this.handleException( err );
                this.send( user, 200 );
            },

            resendAction: function () {
                var email = this.req.body.email;

                UserService
                    .getUserFullDataJson( { email: email } )
                    .then( this.proxy( "verifyAccountOwnership" ) )
                    .fail( this.proxy( "handleException" ) );

            },

            verifyAccountOwnership: function ( user ) {
                if ( !user || (user.role.name.toLowerCase() != 'owner') ) {
                    this.send( {}, 403 );
                    return;
                }

                if ( user.account.active ) {
                    this.send( 'Your account is active. Try to recover your password instead.', 403 );
                    return;
                }

                this.handleRegistrationCode( user );
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