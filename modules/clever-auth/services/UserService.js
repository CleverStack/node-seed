var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , config = require( 'config' )
  , UserService = null;

module.exports = function ( sequelize,
                            ORMUserModel
                             ) {

    if ( UserService && UserService.instance ) {
        return UserService.instance;
    }

    UserService = require( 'services' ).BaseService.extend( {

        authenticate: function ( credentials ) {
            var deferred = Q.defer()
              , service = this
              , chainer = new Sequelize.Utils.QueryChainer();

            service
                .findOne( { where: credentials } )
                .then( function ( user ) {
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
                .fail( deferred.reject );

            return deferred.promise;
        },

        getUserFullDataJson: function ( options ) {
            var deferred = Q.defer()
              , service = this;

            service
                .findOne( { where: options } )
                .then( function ( user ) {

                    if ( !user ) {
                        return deferred.resolve();
                    }

                    var userJson = JSON.parse( JSON.stringify( user ) );

                    deferred.resolve( userJson );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        generatePasswordResetHash: function ( user, tplData ) {
            var deferred = Q.defer()
              , md5 = null
              , hash = null
              , expTime = null
              , actionpath = ( !user.confirmed ) ? 'account_confirm' : 'password_reset_submit'
              , mailsubject = ( !user.confirmed ) ? 'Account Confirmation' : 'Password Recovery';


            if ( !user || !user.createdAt || !user.updatedAt || !user.password || !user.email || !user.AccountId ) {
                deferred.resolve( { statuscode: 403, message: 'Unauthorized' } );
            } else {

                md5 = crypto.createHash( 'md5' );
                md5.update( user.createdAt + user.updatedAt + user.password + user.email + user.AccountId + 'recover', 'utf8' );
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
        },

        mailPasswordRecoveryToken: function ( obj ) {

            // var mailer = sendgrid( config.sendgrid )
            //   , bakeTemplate = ejsFileRender()
            //   , link = config.hosturl + '/' + obj.action + '?u=' + obj.user.id + '&t=' + obj.hash + '&n=' + encodeURIComponent( obj.user.fullName );

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

            service
                .findOne( { where: { email: data.email } } )
                .then( function ( user ) {

                    if ( user !== null ) {
                        deferred.resolve( { statuscode: 400, message: 'Email already exist' } );
                        return;
                    }

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
                        .fail( function ( er ) {
                            console.log( er );
                            deferred.reject();
                        } );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        saveNewUser: function ( data ) {
            var deferred = Q.defer();

            data.username = data.username || data.email;
            data.confirmed = false;
            data.active = true;
            data.password = ( data.password )
                ? crypto.createHash( 'sha1' ).update( data.password ).digest( 'hex' )
                : Math.random().toString( 36 ).slice( -14 );

            this.create( data )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        resendAccountConfirmation: function ( accId, userId, tplData ) {
            var deferred = Q.defer()
              , service = this;

            service
                .findOne( userId )
                .then( function ( user ) {

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
                .fail( deferred.resolve );

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
        },

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
        },

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
        }

    } );

    UserService.instance = new UserService( sequelize );
    UserService.Model = ORMUserModel;

    return UserService.instance;
};