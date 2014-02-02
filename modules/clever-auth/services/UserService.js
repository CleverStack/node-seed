var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , config = require( 'config' )
  , UserService = null;

module.exports = function ( sequelize,
                            ORMUserModel ) {

    if ( UserService && UserService.instance ) {
        return UserService.instance;
    }

    var EmailService = null;

    UserService = require( 'services' ).BaseService.extend( {

        authenticate: function ( credentials ) {
            var deferred = Q.defer()
              , service = this
              , chainer = new Sequelize.Utils.QueryChainer();

            ORMUserModel
                .find( { where: credentials } )
                .success( function ( user ) {

                    if ( !user || !user.active ) {
                        return deferred.resolve();
                    }

                    chainer.add( user.updateAttributes( { accessedAt: moment.utc().format( 'YYYY-MM-DD HH:ss:mm' )  } ) );

                    chainer
                        .runSerially()
                        .success( function ( result ) {

                            var userJson = ( result[0] ) ? JSON.parse( JSON.stringify( result[0] ) ) : {};

                            deferred.resolve( userJson );
                        } )
                        .error( deferred.reject );
                } )
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        getUserFullDataJson: function ( options ) {
            var deferred = Q.defer()
              , service = this;

            ORMUserModel
                .find( { where: options } )
                .success( function ( user ) {

                    if ( !user ) {
                        return deferred.resolve( {} );
                    }

                    var userJson = JSON.parse( JSON.stringify( user ) );

                    deferred.resolve( userJson );
                } )
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        generatePasswordResetHash: function ( user, tplData ) {
            var deferred = Q.defer()
              , md5 = null
              , hash = null
              , expTime = null
              , actionpath = ( !user.confirmed ) ? 'user/confirm' : 'password_reset_submit'
              , mailsubject = ( !user.confirmed ) ? 'User Confirmation' : 'Password Recovery';

            if ( !user || !user.createdAt || !user.updatedAt || !user.password || !user.email ) {
                deferred.resolve( { statuscode: 403, message: 'Unauthorized' } );
            } else {

                md5 = crypto.createHash( 'md5' );
                md5.update( user.createdAt + user.updatedAt + user.password + user.email + 'recover', 'utf8' );
                hash = md5.digest( 'hex' );

                expTime = moment.utc().add( 'hours', 8 ).valueOf();

                deferred.resolve( {
                    hash: hash,
                    expTime: expTime,
                    user: user,
                    action: actionpath,
                    mailsubject: mailsubject,
                    tplData: tplData || null
                } );
            }
            return deferred.promise;
        }, //tested

        mailPasswordRecoveryToken: function ( obj ) {

//            var hosturl = !!config.hosturl
//                ? config.hosturl
//                : [ config['clever-auth'].hostUrl, config.webPort ].join('');
//
//            var link = hosturl + '/' + obj.action + '?u=' + obj.user.id + '&t=' + obj.hash + '&n=' + encodeURIComponent( obj.user.fullName );


            // var payload = { to: obj.user.email, from: 'no-reply@CleverTech.biz' };

            // payload.text = (obj.action === 'account_confirm')
            //     ? "Please click on the link below to activate your account\n " + link
            //     : "Please click on the link below to enter a new password\n " + link;

            // var info = { link: link, companyLogo: 'http://app.CleverTech.biz/images/logo.png', companyName: 'CleverTech' };

            // info.tplName = (obj.action === 'account_confirm')
            //     ? 'userNew'
            //     : 'passwordRecovery';

            // if ( !obj.tplData ) {
            //     payload.subject = 'CleverTech: ' + obj.mailsubject;

            //     info.firstname = obj.user.firstname;
            //     info.username = obj.user.username;
            //     info.user = obj.user;
            //     info.tplTitle = 'CleverTech: Password Recovery';

            // } else {
            //     payload.subject = obj.tplData.subject;

            //     info.tplTitle = obj.tplData.tplTitle;
            //     info.firstName = obj.tplData.firstName;
            //     info.accountSubdomain = obj.tplData.accountSubdomain;
            //     info.userFirstName = obj.tplData.userFirstName;
            //     info.userEmail = obj.tplData.userEmail;
            // }

            return Q.resolve( 'Init Promise Chaining' )
                .then( function () {
                    return { statuscode: 200, message: 'Message successfully sent' };
                } )
                // .then( function() {
                //     return bakeTemplate( info );
                // } )
                // .then( function ( html ) {
                //     payload.html = html;

                //     return mailer( payload );
                // } )
                // .then( function () {
                //     return { statuscode: 200, message: 'Message successfully sent' };
                // } )
                .fail( function ( err ) {
                    console.log( "\n\nERRR: ", err );
                    return { statuscode: 500, message: err };
                } );
        },

        createUser: function ( data, tplData ) {
            var deferred = Q.defer()
              , service = this
              , usr;

            ORMUserModel
                .find( { where: { email: data.email } } )
                .success( function ( user ) {

                    if ( user !== null ) {
                        deferred.resolve( { statuscode: 400, message: 'Email already exist' } );
                        return;
                    }

                    try {
                        EmailService = require( 'services' )['EmailService'];
                    } catch ( err ) {
                        console.log( err );
                    }

                    if ( EmailService === null || !config['clever-auth'].email_confirmation ) {

                        data.confirmed = true;

                        service
                            .saveNewUser( data )
                            .then( deferred.resolve )
                            .fail( deferred.reject );

                    } else {

                        data.confirmed = false;

                        service
                            .saveNewUser( data )
                            .then( function ( user ) {
                                usr = user;
                                return service.generatePasswordResetHash( user, tplData );
                            } )
                            .then( service.mailPasswordRecoveryToken )
                            .then( function () {
                                deferred.resolve( usr );
                            } )
                            .fail( function ( err ) {
                                console.log( err );
                                deferred.reject();
                            } );
                    }
                } )
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        saveNewUser: function ( data ) {
            var deferred = Q.defer();

            data.username = data.username || data.email;
            data.active = true;
            data.password = data.password
                ? crypto.createHash( 'sha1' ).update( data.password ).digest( 'hex' )
                : Math.random().toString( 36 ).slice( -14 );

            ORMUserModel
                .create( data )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        resendAccountConfirmation: function ( userId, tplData ) {
            var deferred = Q.defer()
              , service = this;

            ORMUserModel
                .find( userId )
                .success( function ( user ) {

                    if ( !user ) {
                        deferred.resolve( { statuscode: 403, message: 'User doesn\'t exist' } );
                        return;
                    }

                    if ( user.confirmed ) {
                        deferred.resolve( { statuscode: 403, message: user.email + ' , has already confirmed the account' } );
                        return;
                    }

                    tplData.userFirstName = user.firstname;

                    tplData.userEmail = user.email;

                    service.generatePasswordResetHash( user, tplData )
                        .then( service.mailPasswordRecoveryToken )
                        .then( function () {
                            deferred.resolve( { statuscode: 200, message: 'A confirmation link has been resent' } );
                        } )
                        .fail( deferred.reject );

                } )
                .error( deferred.resolve );

            return deferred.promise;
        },

        handleUpdateUser: function ( userId, data ) {
            var deferred = Q.defer();

            ORMUserModel
                .find( { where: { id: userId } } )
                .success( function ( user ) {

                    if ( !user ) {
                        deferred.resolve( { statuscode: 403, message: 'invalid id' } );
                        return;
                    }

                    if ( data.password && data.new_password ) {

                        if ( crypto.createHash( 'sha1' ).update( data.password ).digest( 'hex' ) !== user.password ) {
                            deferred.resolve( {statuscode: 403, message: 'Invalid password'} );
                            return;
                        }

                        data.hashedPassword = crypto.createHash( 'sha1' ).update( data.new_password ).digest( 'hex' );
                    }

                    this
                        .checkEmailAndUpdate( user, data )
                        .then( deferred.resolve )
                        .fail( deferred.reject );

                }.bind( this ) )
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        checkEmailAndUpdate: function ( user, data ) {
            var deferred = Q.defer();

            if ( data.email && ( user.email != data.email ) ) {

                ORMUserModel
                    .find( { where: { email: data.email } } )
                    .success( function ( chkUser ) {

                        if ( chkUser ) {
                            deferred.resolve( { statuscode: 400, message: "email already exists" } );
                            return;
                        }

                        this
                            .updateUser( user, data )
                            .then( deferred.resolve )
                            .fail( deferred.reject );

                    }.bind( this ) )
                    .error( deferred.reject );
            } else {

                this
                    .updateUser( user, data )
                    .then( deferred.resolve )
                    .fail( deferred.reject );
            }

            return deferred.promise;
        }, //tested

        updateUser: function ( user, data ) {
            var deferred = Q.defer();

            user.firstname = data.firstname || user.firstname;
            user.lastname = data.lastname || user.lastname;
            user.email = data.email || user.email;
            user.phone = data.phone || user.phone;

            if ( data.hashedPassword ) {
                user.password = data.hashedPassword;
            }

            user.save()
                .success( function ( user ) {

                    this
                        .getUserFullDataJson( { id: user.id } )
                        .then( deferred.resolve )
                        .fail( deferred.reject );

                }.bind( this ) )
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        listUsers: function() {
            var deferred = Q.defer();

            ORMUserModel
                .findAll( { where: { deletedAt: null } } )
                .success( function( users ) {
                    if ( !!users && !!users.length ) {
                        deferred.resolve( users.map( function( u ) { return u.toJSON(); } ) );
                    } else {
                        deferred.resolve( {} );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        deleteUser: function( userId ) {
            var deferred = Q.defer();

            ORMUserModel
                .find( userId )
                .success( function( user ) {

                    if ( !!user && !!user.id ) {

                        user
                            .destroy()
                            .success( function( result ) {

                                if ( !result.deletedAt ) {
                                    deferred.resolve( { statuscode: 500, message: 'error' } );
                                } else {
                                    deferred.resolve( { statuscode: 200, message: 'user is deleted' } );
                                }

                            })
                            .error( deferred.reject );

                    } else {
                        deferred.resolve( { statuscode: 403, message: 'user do not exist' } )
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }

    } );

    UserService.instance = new UserService( sequelize );
    UserService.Model = ORMUserModel;

    return UserService.instance;
};