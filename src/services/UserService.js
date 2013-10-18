var BaseService = require('./BaseService')
  , Q = require('q')
  , crypto = require('crypto')
  , moment = require('moment')
  , sendgrid = require( '../../utils/sendgrid' )
  , ejsFileRender = require( '../../utils/ejsfilerender' )
  , UserService = null;

module.exports = function( db, UserModel, AccountModel, RoleModel, config ) {

    var mailer = sendgrid( config.sendgrid );

    if (UserService && UserService.instance) {
        return UserService.instance;
    }

    UserService = BaseService.extend({
        authenticate: function(credentials) {
            var deferred = Q.defer()
            ,   service = this;


            UserModel
            .find({ where: credentials, include: [ AccountModel, RoleModel ] })
            .success( function( user ){
                if( !user || !user.active ){ return deferred.resolve( ) };

                user
                .updateAttributes({ accessedAt: moment.utc().format('YYYY-MM-DD HH:ss:mm')  })
                .success( deferred.resolve )
                .error( deferred.reject );

            })
            .error( deferred.reject );

            return deferred.promise;
        },

        getUserFullDataJson : function(options){
            var deferred = Q.defer();

            UserModel.find({ where: options, include: [ AccountModel, RoleModel ] })
            .success( deferred.resolve )
            .error( deferred.reject );

            return deferred.promise;
        },

        //Create a Hash, A Timestamp of 24h, and UserId
        generatePasswordResetHash : function( user ){
            var deferred = Q.defer()
            ,   md5 = null
            ,   hash = null
            ,   expTime = null
            ,   actionpath  = ( !user.confirmed ) ? 'account_confirm'      : 'password_reset_submit'
            ,   mailsubject = ( !user.confirmed ) ? 'Account Confirmation' : 'Password Recovery' ;


            if( !user || !user.createdAt || !user.updatedAt || !user.password || !user.email ||  !user.AccountId ){
                deferred.resolve({ statuscode: 403, message: "unauthorized" });
            }else{

                md5 = crypto.createHash('md5');
                md5.update( user.createdAt+ user.updatedAt+ user.password+ user.email+ user.AccountId+ 'recover', 'utf8' );
                hash = md5.digest('hex');

                expTime = moment.utc().add('hours', 8).valueOf();

                deferred.resolve({
                     hash: hash
                    ,expTime: expTime
                    ,user: user
                    ,action: actionpath
                    ,mailsubject: mailsubject
                });
            }
            return deferred.promise;
        },

        mailPasswordRecoveryToken : function( obj ){
            var mailer = sendgrid( config.sendgrid )
             ,  bakeTemplate = ejsFileRender( config.mailTemplatePaths );

            var  to      = obj.user.email
                ,from    = obj.mailfrom || config.sendgrid.defaults.from
                ,subject = obj.mailsubjct || config.sendgrid.defaults.subject
                // ,link    = config.hosturl + '/' + obj.action + '/' + obj.user.id + '/' + obj.hash + '?n=' + encodeURIComponent(obj.user.fullName)
                ,link    = config.hosturl + '/' + obj.action + '?u=' + obj.user.id + '&t=' + obj.hash + '&n=' + encodeURIComponent(obj.user.fullName)
                ,text
                ,info    = {
                    link: link,
                    user: obj.user
                };

            return Q.resolve( 'Init Promise Chaining' )
                    .then(function(){
                        var template;
                        if(obj.action == 'account_confirm') {
                            template = 'accountActivation';
                            text = "Please click on the link below to activate your account\n " + link;
                        } else if(obj.action == 'password_reset_submit'){
                            template = 'passwordRecovery';
                            text = "Please click on the link below to enter a new password\n " + link;
                        } else {
                            throw new Error('unable to resolve template');
                        }

                        return bakeTemplate( template, info )
                    })
                    .then( function( html ){
                        console.log('Sending...Mail');
                        return mailer( to, from, subject, text, html );
                    })
                    .then(function(){
                        return { statuscode: 200, message:'Message successfully sent' };
                    })
                    .fail(function( err ){
                        return { statuscode: 500, message: err };
                    });
        },

        createUser : function( data ){
            // delete data.createdAt;
            // delete data.accessedAt;
            var deferred = Q.defer()
            ,   service = this
            ,   usr;

            UserModel
            .find({ where: { email: data.email } })
            .success( function( user ){

                if( user !== null ){
                    deferred.resolve({ statuscode:400, message: 'Email already exist' });
                    return;
                }

                // service
                // .saveNewUser( data )
                // .then(service.generatePasswordResetHash)
                // .then(service.mailPasswordRecoveryToken)
                // .then(function(msg){
                //     deferred.resolve({ statuscode:200, message:"A confirmation link has been sent to user " });
                // })
                // .fail( deferred.reject );

                service
                .saveNewUser( data )
                .then(function( user ){
                    usr = user;
                    return service.generatePasswordResetHash( user );
                })
               .then( service.mailPasswordRecoveryToken )
               .then(function(){
                    deferred.resolve( usr );
                })
                .fail( function(er){
                    console.log(er);
                    deferred.reject();
                });
            })
            .error( deferred.reject );

            return deferred.promise;
        },

        saveNewUser : function( data ){
            var deferred = Q.defer();

            if( !data.AccountId ){
                deferred.resolve({ statuscode: 403, message: "unauthorized" });

            }else{
                data.username   = data.username || data.email;
                data.RoleId     = data.RoleId   || 7; //Default into general user
                data.confirmed  = false;
                data.active     = false;
                data.password   = ( data.password ) ? crypto.createHash('sha1').update(data.password).digest('hex')
                                                    : Math.random().toString(36).slice(-14)
                                                    ;

                UserModel
                .create( data )
                .success( deferred.resolve )
                .error( deferred.reject );
            }

            return deferred.promise;
        },

        resendAccountConfirmation : function( accId, userId ){
            var deferred = Q.defer(),
                service  = this;

            UserModel.find( userId )
            .success( function( user ){

                if( !user || ( user.AccountId != accId ) ){
                    deferred.resolve({ statuscode:403, message: 'User doesn\'t exist or invalid account' });
                    return;
                }

                if( user.confirmed ){
                    deferred.resolve({ statuscode:403, message: user.email + ' , has already confirmed the account' });
                    return;
                }

                service.generatePasswordResetHash(user)
                .then(service.mailPasswordRecoveryToken)
                .then(function(){
                    deferred.resolve({ statuscode:200, message: 'A confirmation link has been resent' });
                })
                .fail( deferred.reject );

            })
            .error( deferred.resolve );

            return deferred.promise;

        }

    });

    UserService.instance = new UserService(db);
    UserService.Model = UserModel;

    return UserService.instance;
};
