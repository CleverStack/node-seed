var Q = require( 'q' )
  , Sequelize = require( 'sequelize' )
  , shortid = require( 'shortid' )
  , config = require( 'config' )
  , mailer = require( '../lib/mailer' )( config['clever-email'] )
  , _ = require( 'lodash' )
  , EmailService = null;

module.exports = function ( sequelize,
                            ORMEmailModel,
                            ORMEmailAttachmentModel,
                            ORMUserModel,
                            ORMEmailUserModel ) {

    if ( EmailService && EmailService.instance ) {
        return EmailService.instance;
    }

    EmailService = require( 'services' ).BaseService.extend( {

        formatReplyAddress: function ( emailToken ) {
            var addr = ''
              , envName = '';

            envName = ( config.environmentName == 'DEV' )
                ? 'dev'
                : ( config.environmentName == 'PROD' )
                    ? 'prod'
                    : ( config.environmentName == 'STAGE' )
                        ? 'stage'
                        : 'local';

            addr = ( envName != 'prod' )
                ? 'reply_' + emailToken + '@' + envName + '.bolthr.clevertech.biz'
                : 'reply_' + emailToken + '@app-mail.bolthr.com';

            return addr;
        }, 

        formatData: function ( data ) {
            var o = {
                email: {},
                usersCC: [],
                usersBCC: [],
                attachments: [],
                sender: {}
            };

            var hasTemplate = (/false|true/.test( data.hasTemplate )) ? data.hasTemplate : true
              , fullName = data.userFirstName || data.userLastName
                    ? [ data.userFirstName, data.userLastName ].join( ' ' )
                    : config['clever-email'].default.fromName;

            //Email Object
            o.email.subject = data.subject || null;
            o.email.body = data.body || null;
            o.email.token = data.userId + data.to.id + shortid.seed( 10000 ).generate();
            o.email.UserId = data.userId;
            o.email.AccountId = data.accId;
            o.email.EmailTemplateId = data.EmailTemplateId || null;
            o.email.sentAttemps = 0;
            o.email.isDelivered = false;
            o.email.isOpened = false;
            o.email.id = null;

            var emailURL = this.formatReplyAddress( o.email.token );

            //Dump email dependency data
            var dataDump = {
                companyLogo: data.accLogo,
                companyName: data.accName,
                fromName: fullName,
                fromMail: emailURL,
                toMail: data.to.email,
                usersCC: ( data.cc && data.cc.length ) ? data.cc.map( function ( x ) { return x.email } ) : [],
                usersBCC: ( data.bcc && data.bcc.length) ? data.bcc.map( function ( x ) { return x.email } ) : [],
                tplName: config['clever-email'].default.tplName,
                tplTitle: data.subject || config['clever-email'].default.subject,
                hasTemplate: hasTemplate
            };

            o.email.dump = JSON.stringify( dataDump );

            //EmailUsers Object
            o.usersCC = ( data.cc && data.cc.length ) ? data.cc : [];
            o.usersBCC = ( data.bcc && data.bcc.length) ? data.bcc : [];

            //EmailAttachements Object
            o.attachments = ( data.attachments && data.attachments.length ) ? data.attachments : [];

            //EmailSender Object
            o.sender.fullName = fullName;
            o.sender.email    = emailURL;

            //EmailSurvey Object
            o.survey = ( data.survey ) ? data.survey : null;

            o.hasTemplate = hasTemplate;

            return o;
        }, 

        listEmails: function ( userId ) {
            var deferred = Q.defer();

            this
                .find( { where: { UserId: userId }, include: [ ORMEmailAttachmentModel ] } )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        }, 

        getEmailByIds: function ( userId, emailId ) {
            var deferred = Q.defer()
              , service = this
              , chainer = new Sequelize.Utils.QueryChainer();

            chainer.add(
                ORMEmailModel.find( {
                    where: { id: emailId, UserId: userId, 'deletedAt': null }, include: [ ORMEmailAttachmentModel ]
                } )
            );

            chainer.add(
                ORMEmailUserModel.findAll( {
                    where: { EmailId: emailId, 'deletedAt': null }, include: [ ORMUserModel ]
                } )
            );

            chainer
                .run()
                .success( function ( results ) {

                    if ( !results[0] ) {
                        deferred.resolve( {statuscode: 403, message: 'invalid'} );
                        return;
                    }

                    var emailJson = JSON.parse( JSON.stringify( results[ 0 ] ) );
                    var emailUsers = results[ 1 ];

                    emailJson.users = emailUsers;
                    deferred.resolve( emailJson );

                } )
                .error( deferred.reject );

            return deferred.promise;
        }, 

        handleEmailCreation: function ( data ) {
            var deferred = Q.defer()
              , promises = []
              , service = this;

            data.forEach( function ( item ) {
                promises.push( service.processEmailCreation( item ) );
            } );

            Q.all( promises )
                .then( function() {
                    deferred.resolve( {statuscode: 200, message: 'email is created'} );
                })
                .fail( deferred.reject );

            return deferred.promise;
        }, 

        processEmailCreation: function ( emailItem ) {
            var deferred = Q.defer()
              , service = this
              , fData = this.formatData( emailItem );

            service
                .create( fData.email )
                .then( function ( savedEmail ) {
                    service
                        .saveEmailAssociation( savedEmail, fData )
                        .then( function () {
                            deferred.resolve();
                        } )
                        .then( deferred.resolve )
                        .fail( deferred.reject );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        }, 

        saveEmailAssociation: function ( savedEmail, fData ) {
            var deferred = Q.defer()
              , chainer = new Sequelize.Utils.QueryChainer();

            //Users: CC
            if ( fData.usersCC.length ) {
                var l = fData.usersCC.length
                  , item
                  , cc = [];
                while ( l-- ) {
                    item = fData.usersCC[l];
                    cc.push( {
                        EmailId: savedEmail.id, UserId: item.id, status: 'cc'
                    } );
                }

                chainer.add( ORMEmailUserModel.bulkCreate( cc ) );
            }

            //Users: BCC
            if ( fData.usersBCC.length ) {
                var l = fData.usersBCC.length
                  , itm
                  , bcc = [];

                while ( l-- ) {
                    itm = fData.usersBCC[l];
                    bcc.push( {
                        EmailId: savedEmail.id, UserId: itm.id, status: 'bcc'
                    } );
                }

                chainer.add( ORMEmailUserModel.bulkCreate( bcc ) );
            }

            //Attachments
            if ( fData.attachments.length ) {
                var l = fData.attachments.length
                  , attch
                  , emailDocs = [];

                while ( l-- ) {
                    attch = fData.attachments[l];
                    emailDocs.push( {
                        id: null,
                        filePath: attch.filePath,
                        fileName: attch.fileName,
                        mimeType: attch.mimeType,
                        EmailId: savedEmail.id
                    } );
                }

                chainer.add( ORMEmailAttachmentModel.bulkCreate( emailDocs ) );
            }

            chainer
                .run()
                .success( function ( result ) {
                    deferred.resolve(result);
                } )
                .error( function ( err ) {
                    deferred.reject( err );
                } );

            return deferred.promise;
        }, 

        handleEmailSending: function ( userId, emailId, type ) {
            var deferred = Q.defer()
              , service = this;

            service
                .getEmailByIds( userId, emailId )
                .then( function( result ) {

                    if ( !!result && !!result.id && !!result.body ) {

                        service
                            .sendEmail( result, result.body, type )
                            .then( deferred.resolve )
                            .fail( deferred.reject );

                    } else {
                        deferred.resolve( result )
                    }
                })
                .fail( deferred.reject );

            return deferred.promise;
        }, 

        sendEmail: function ( email, body, type ) {
            var deferred = Q.defer();

            email.dump = _.isPlainObject( email.dump )
                ? email.dump
                : JSON.parse( email.dump );

            mailer.send( email, body, type )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        }, 

        deleteEmail: function( userId, emailId ) {
            var deferred = Q.defer()
              , service = this;

            service
                .getEmailByIds( userId, emailId )
                .then( function( result ) {

                    if ( !!result && !!result.id ) {

                        service
                            .destroy( emailId )
                            .then( function() {
                                deferred.resolve( { statuscode: 200, message: 'email is deleted'} )
                            })
                            .fail( deferred.reject );

                    } else {
                        deferred.resolve( result )
                    }
                })
                .fail( deferred.reject );

            return deferred.promise;

        }

    } );

    EmailService.instance = new EmailService( sequelize );
    EmailService.Model = ORMEmailModel;

    return EmailService.instance;
};