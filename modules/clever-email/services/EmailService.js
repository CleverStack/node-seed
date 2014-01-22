var Q = require( 'q' )
  , Sequelize = require( 'sequelize' )
  , ejsFileRender = require( '../lib/ejsfilerender' )
  , shortid = require( 'shortid' )
  , config = require( 'config' )
  , mailer = require( '../lib/mailer' )( config['clever-email'] )
  , EmailService = null;

module.exports = function ( sequelize,
                            ORMEmailModel,
                            ORMEmailAttachmentModel,
                            ORMEmailReplyModel,
                            ORMUserModel,
                            ORMEmailUserModel,
                            EmailTemplateService ) {

    var bakeTemplate = ejsFileRender();

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
        }, /* tested */

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
        }, /* tested */

        formatRepliedData: function ( data ) {

            var replyAddr = this.formatReplyAddress( data.emailToken );

            var o = {
                id: null,
                reply: data.reply,
                EmailId: data.emailId,
                token: data.emailId + '_' + shortid.seed( 10000 ).generate(),
                sentAttemps: 1,
                isDelivered: true,
                isOpened: false,
                from: data.from.indexOf( data.userEmail ) != -1 ? data.userEmail : null,
                to: data.to
            };

            var t = {
                subject: data.subject,
                html: data.replyHTML,
                replyAddress: replyAddr,
                from: data.from,
                to: data.to
            };

            o.dump = JSON.stringify( t );

            return o;
        }, /* tested */

        listEmails: function ( userId ) {
            var deferred = Q.defer();

            this
                .find( { where: { UserId: userId }, include: [ ORMEmailAttachmentModel, ORMEmailReplyModel ] } )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        }, /* tested */

        getEmailByIds: function ( userId, emailId ) {
            var deferred = Q.defer()
              , service = this
              , chainer = new Sequelize.Utils.QueryChainer();

            chainer.add(
                ORMEmailModel.find( {
                    where: { id: emailId, UserId: userId, 'deletedAt': null }, include: [ ORMEmailAttachmentModel, ORMEmailReplyModel ]
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
        }, /* tested */

        handleEmailCreation: function ( data ) {
            var deferred = Q.defer()
              , promises = []
              , service = this;

            data.forEach( function ( item ) {
                promises.push( service.processEmailCreation( item ) );
            } );

            Q.all( promises )
                .then( function() {
                    deferred.resolve();
                })
                .fail( deferred.reject );

            return deferred.promise;
        }, /* tested */

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
        }, /* tested */

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
        }, /* tested */

        renderTemplate: function ( data ) {
            var deferred = Q.defer()
              , email = data.email
              , user = data.user || null
              , tplName = data.tplName || null
              , tpl = {};

            tpl.tplName = tplName || config['clever-email'].default.tplName;
            tpl.tplTitle = email.subject || config['clever-email'].default.subject;
            tpl.companyName = ( email.dump.companyName ) ? email.dump.companyName : config['clever-email'].default.fromName;
            tpl.companyLogo = ( email.dump.companyLogo ) ? email.dump.companyLogo : config['clever-email'].default.logo;

            //Text has already being parsed from frontend
            if ( !email.EmailTemplateId ) {
                tpl.strHTML = email.body;

                bakeTemplate( tpl )
                    .then( deferred.resolve )
                    .fail( deferred.reject );

            } else {

                EmailTemplateService
                    .getPlaceholderData( {
                        accId: email.AccountId,
                        EmailTemplateId: email.EmailTemplateId
                    } )
                    .then( function ( emailTemplate ) {
                        return EmailTemplateService.processTemplateIntrpolation( user, emailTemplate );
                    } )
                    .then( function ( html ) {
                        tpl['strHTML'] = html;

                        return bakeTemplate( tpl );
                    } )
                    .then( deferred.resolve )
                    .fail( deferred.reject );
            }

            return deferred.promise;
        },

        sendEmail: function ( email, html ) {
            var deferred = Q.defer();

            mailer.send( email, html )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        processMailReply: function ( data ) {
            var deferred = Q.defer()
              , service = this;

            this
                .findOne( { where: { token: data.replyMailHash }, include: [ ORMUserModel ] } )
                .then( function ( email ) {

                    if ( !email || !email.id ) {
                        console.log( "\n\n----- EMAIL REPLY TOKEN DOES NOT EXISTS ------\n" );
                        deferred.resolve();
                        return;
                    }

                    console.log( "\n\n----- EMAIL REPLY TOKEN EXISTS ------\n" );

                    data['emailId'] = email.id;
                    data['emailToken'] = email.token;
                    data['userEmail'] = email.user.email;
                    data['userName'] = email.user.firstname + ' ' + email.user.lastname;

                    service
                        .saveMailReply( data )
                        .then( deferred.resolve )
                        .fail( deferred.reject );

                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        saveMailReply: function ( data ) {
            var deferred = Q.defer()
              , replyData = this.formatRepliedData( data );

            ORMEmailReplyModel
                .create( replyData )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        },

        processMailReplyNotification: function ( savedReply ) {
            var deferred = Q.defer()
              , mail = JSON.parse( JSON.stringify( savedReply ) )
              , payload = { };

            payload[ 'from' ] = mail.dump.replyAddress;
            payload[ 'fromname' ] = mail.dump.fromname;
            payload[ 'to' ] = [ mail.to ];
            payload[ 'toname' ] = mail.dump.toname;

            payload[ 'subject' ] = mail.dump.subject;
            payload[ 'text' ] = mail.reply;
            payload[ 'html' ] = mail.dump.html;

            mailer( payload )
                .then( deferred.resolve )
                .fail( deferred.resolve );

            return deferred.promise;
        },

        processMailEvents: function ( evns ) {
            var deferred = Q.defer()
                , item = null
                , chainer = new Sequelize.Utils.QueryChainer();

            while ( item = evns.pop() ) {
                console.log( "\nUPDATING: ", item.email_id );
                chainer.add( ORMEmailModel.update( { isOpened: true }, { id: item.email_id, 'deletedAt': null} ) );
            }

            chainer
                .run()
                .success( function () {
                    deferred.resolve( {statuscode: 200, message: 'ok'} );
                } )
                .error( deferred.reject );

            return deferred.promise;
        }

    } );

    EmailService.instance = new EmailService( sequelize );
    EmailService.Model = ORMEmailModel;

    return EmailService.instance;
};