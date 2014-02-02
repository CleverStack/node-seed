var crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , passport = require( 'passport' )
  , LocalStrategy = require( 'passport-local' ).Strategy;

module.exports = function ( UserService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new LocalStrategy( function ( username, password, done ) {
        var credentials = {
            email: username,
            password: crypto.createHash( 'sha1' ).update( password ).digest( 'hex' ),
            confirmed: true,
            active: true
        };

        UserService.authenticate( credentials )
            .then( done.bind( null, null ) )
            .fail( done );
    } ) );

    return (require( 'classes' ).Controller).extend(
        {
            service: UserService,

            requiresLogin: function ( req, res, next ) {

                if ( !req.isAuthenticated() ) {
                    return res.send( 401 );
                }

                next();
            }, //tested

            requiresAdminRights: function ( req, res, next ) {

                if ( !req.isAuthenticated() || !req.session.passport.user || !req.session.passport.user.hasAdminRight ) {
                    return res.send( 403 );
                }

                next();
            }, //tested

            checkPasswordRecoveryData: function ( req, res, next ) {
                var userId = req.body.userId
                  , password = req.body.password
                  , token = req.body.token

                if ( !userId ) {
                    return res.send( 400, 'Invalid user Id.' );
                }

                if ( !token ) {
                    return res.send( 400, 'Invalid Token.' );
                }

                if ( !password ) {
                    return res.send( 400, 'Password does not much the requirements' );
                }

                next();
            } //tested
        },
        {
            listAction: function () {
                UserService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            getAction: function () {
                var uId = this.req.params.id;

                UserService.getUserFullDataJson( { id: uId } )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            postAction: function () {
                var data = this.req.body;

                if ( data.id ) {
                    return this.putAction();
                }

                if ( !data.email ) {
                    this.send( 'Email is mandatory', 400 );
                    return;
                }

                var tplData = {
                    firstName: data.firstname,
                    userEmail: data.email,
                    tplTitle: 'User Confirmation',
                    subject: data.firstname || data.email + ' wants to add you to their recruiting team!'
                };


                UserService
                    .createUser( data, tplData )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested without email confirmation

            putAction: function () {
                var meId = this.req.user.id
                  , userId = this.req.params.id
                  , data = this.req.body;

                if ( !userId ) {
                    this.send( 'Bad Request', 400 );
                    return;
                }

                UserService
                    .handleUpdateUser( userId, data )
                    .then( this.proxy( 'handleSessionUpdate', meId ) )
                    .fail( this.proxy( 'handleException' ) );

            }, //tested

            handleSessionUpdate: function ( meId, user ) {
                if ( user.id && ( meId === user.id ) ) {
                    this.loginUserJson ( user );
                    return;
                }

                this.handleServiceMessage( user );
            }, //tested through putAction

            deleteAction: function () {
                var uId = this.req.params.id;

                UserService.deleteUser( uId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );

            }, //tested

            loginAction: function () {
                passport.authenticate( 'local', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
            }, //tested

            handleLocalUser: function ( err, user ) {
                if ( err ) return this.handleException( err );
                if ( !user ) return this.send( {}, 403 );
                this.loginUserJson( user );
            }, //tested through loginAction

            loginUserJson: function ( user ) {
                this.req.login( user, this.proxy( 'handleLoginJson', user ) );
            }, //tested through loginAction,  putAction, currentAction

            handleLoginJson: function ( user, err ) {
                if ( err ) return this.handleException( err );
                this.send( user, 200 );
            }, //tested through loginAction,  putAction

            currentAction: function () {
                var user = this.req.user
                  , reload = this.req.query.reload || false;

                if ( !user ) {
                    this.send( {}, 404 );
                    return;
                }

                if ( !reload ) {
                    this.send( user, 200 );
                    return;
                }

                UserService
                    .getUserFullDataJson( { id: user.id } )
                    .then( this.proxy( 'loginUserJson' ) )
                    .fail( this.proxy( 'handleException' ) );

            }, //tested

            logoutAction: function () {
                this.req.logout();
                this.res.send( {}, 200 );
            }, //tested

            recoverAction: function () {
                var email = this.req.body.email;

                if ( !email ) {
                    this.send( 'missing email', 400 );
                    return;
                }

                UserService
                    .find( { where: { email: email } } )
                    .then( this.proxy( 'handlePasswordRecovery' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            handlePasswordRecovery: function ( user ) {

                if ( !user.length ) {
                    this.send( {}, 403 );
                    return;
                }

                UserService
                    .generatePasswordResetHash( user[0] )
                    .then( this.proxy( 'handleMailRecoveryToken' ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            handleMailRecoveryToken: function ( recoverData ) {

                if ( !recoverData.hash && recoverData.statuscode ) {
                    this.handleServiceMessage( recoverData );
                    return;
                }

                UserService
                    .mailPasswordRecoveryToken( recoverData )
                    .then( this.proxy( "handleServiceMessage" ) )
                    .fail( this.proxy( "handleException" ) );
            },

            resetAction: function () {
                var userId = this.req.body.userId || this.req.body.user,
                    password = this.req.body.password,
                    token = this.req.body.token;

                UserService
                    .findById( userId )
                    .then( this.proxy( 'handlePasswordReset', password, token ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            handlePasswordReset: function ( password, token, user ) {

                if ( !user ) {
                    this.send( {}, 403 );
                    return;
                }

                UserService
                    .generatePasswordResetHash( user )
                    .then( this.proxy( 'verifyResetTokenValidity', user, password, token ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            verifyResetTokenValidity: function ( user, newPassword, token, resetData ) {

                if ( !resetData.hash && resetData.statuscode ) {
                    this.handleServiceMessage( resetData );
                    return;
                }

                var hash = resetData.hash;
                if ( token != hash ) {
                    return this.send( 'Invalid token', 400 );
                }

                this.handleUpdatePassword( newPassword, [user] );

            },

            handleUpdatePassword: function ( newPassword, user ) {

                if ( user.length ) {
                    user = user[0];
                    user.updateAttributes( {
                        password: crypto.createHash( 'sha1' ).update( newPassword ).digest( 'hex' )
                    } ).success( function ( user ) {
                            this.send( {status: 200, results: user} );
                        }.bind( this )
                        ).fail( this.proxy( 'handleException' ) );
                } else {
                    this.send( {status: 400, error: "Incorrect old password!"} );
                }
            },

            confirmAction: function () {
                var password = this.req.body.password
                  , token = this.req.body.token
                  , userId = this.req.body.userId;


                UserService.findById( userId )
                    .then( this.proxy( 'handleAccountConfirmation', password, token ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            handleAccountConfirmation: function ( pass, token, user ) {
                if ( !user ) {
                    this.send( 'Invalid confirmation link', 403 );
                    return;
                }
                if ( user.confirmed ) {
                    this.send( 'You have already activated your account', 400 );
                    return;
                }

                UserService.generatePasswordResetHash( user )
                    .then( this.proxy( "confirmAccount", user, pass, token ) )
                    .fail( this.proxy( "handleException" ) );

            },

            confirmAccount: function ( user, pass, token, hashobj ) {

                if ( !hashobj.hash && hashobj.statuscode ) {
                    this.handleServiceMessage( hashobj );
                    return;
                }

                if ( token !== hashobj.hash ) {
                    this.send( 'Invalid token', 400 );
                    return;
                }

                var newpass = crypto.createHash( 'sha1' ).update( pass ).digest( 'hex' );

                user
                    .updateAttributes( {
                        active: true,
                        confirmed: true,
                        password: newpass
                    } )
                    .success( this.proxy( 'send', 200 ) )
                    .error( this.proxy( 'handleException' ) );

            },

            resendAction: function () {
                var me = this.req.user
                  , userId = this.req.params.id
                  , data = this.req.body;

                var tplData = {
                    firstName: this.req.user.firstname, accountSubdomain: this.req.user.account.subdomain, userFirstName: '', userEmail: '', tplTitle: 'Account Confirmation', subject: this.req.user.firstname + ' wants to add you to their recruiting team!'
                };

                UserService
                    .resendAccountConfirmation( me.account.id, userId, tplData )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .then( this.proxy( 'handleException' ) );

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