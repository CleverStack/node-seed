var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )
  , testEnv = require ( 'utils' ).testEnv()
  , Q = require ( 'q' );

describe( 'service.EmailService', function () {
    var Service, Model, UserModel, EmailUserModel;

    var userId, userId_1, userId_2, userId_3, userId_4
      , emailId_1, emailId_1_token, emailId_2;

    before( function ( done ) {
        testEnv( function ( _EmailService_, _EmailModel_, _UserModel_, _EmailUserModel_ ) {

            Service = _EmailService_;
            Model = _EmailModel_;
            UserModel = _UserModel_;
            EmailUserModel = _EmailUserModel_;

            var user = { username: 'sender', email: 'sender@mail.ru', password: '1234' };

            UserModel
                .create( user )
                .success( function( sender ) {

                    expect( sender ).to.be.an( 'object' );
                    expect( sender ).to.have.property( 'id' ).and.be.ok;
                    expect( sender ).to.have.property( 'username' ).and.equal( user.username );

                    userId = sender.id;

                    done();
                })
                .error( done );


        }, done );
    } );

    describe( '.formatReplyAddress( emailToken )', function () {

        it( 'should return an address according to environmentName', function ( done ) {

            var emailToken = '15da5AS15A1s';

            var addr = Service.formatReplyAddress( emailToken );

            if ( config.environmentName == 'DEV' ){
                expect( addr ).to.equal( 'reply_15da5AS15A1s@dev.bolthr.clevertech.biz' );
            } else if ( config.environmentName == 'PROD' ) {
                expect( addr ).to.equal( 'reply_15da5AS15A1s@app-mail.bolthr.com' );
            } else if ( config.environmentName == 'STAGE' ) {
                expect( addr ).to.equal( 'reply_15da5AS15A1s@stage.bolthr.clevertech.biz' );
            } else {
                expect( addr ).to.equal( 'reply_15da5AS15A1s@local.bolthr.clevertech.biz' );
            }

            done();
        } );

    } );

    describe( '.formatData( data )', function () {

        it( 'should return an object with filtered data', function ( done ) {

            var data = {
                title: 'some title',
                subject: 'some subject',
                body: 'some body',
                userId: 5,
                accId: 1,
                to: {
                    id: 15,
                    email: 'to1@email.za'
                },
                hasTemplate: false,
                cc: [ { email:'cc1@mail.ru' }, { email: 'cc2@mail.ru' } ],
                bcc: [ { email: 'bcc1@mail.com' }, { email: 'bcc2@mail.com' } ],
                accLogo: 'LoGo',
                accName: 'Default Name',
                userFirstName: 'Dmitrij',
                userLastName: 'Safronov',
                EmailTemplateId: 45
            };

            var emailData = Service.formatData( data );

            expect( emailData ).to.be.an( 'object' );
            expect( emailData ).to.contain.keys( 'email', 'usersCC', 'usersBCC', 'attachments', 'survey', 'sender', 'hasTemplate' );

            expect( emailData.email ).to.be.an( 'object' );
            expect( emailData.email ).to.have.property( 'subject' ).and.equal( data.subject );
            expect( emailData.email ).to.have.property( 'body' ).and.equal( data.body );
            expect( emailData.email ).to.have.property( 'token' );
            expect( emailData.email ).to.have.property( 'UserId' ).and.equal( data.userId );
            expect( emailData.email ).to.have.property( 'AccountId' ).and.equal( data.accId );
            expect( emailData.email ).to.have.property( 'EmailTemplateId' ).and.equal( data.EmailTemplateId );
            expect( emailData.email ).to.have.property( 'sentAttemps' ).and.equal( 0 );
            expect( emailData.email ).to.have.property( 'isDelivered' ).and.equal( false );
            expect( emailData.email ).to.have.property( 'isOpened' ).and.equal( false );
            expect( emailData.email ).to.have.property( 'id' ).and.not.ok;

            expect( emailData.email ).to.have.property( 'dump' );
            
            var dump = JSON.parse( emailData.email.dump );
            
            expect( dump ).to.have.property( 'companyLogo' ).and.equal( data.accLogo );
            expect( dump ).to.have.property( 'companyName' ).and.equal( data.accName );
            expect( dump ).to.have.property( 'fromName' ).and.equal( [ data.userFirstName, data.userLastName ].join( ' ' ) );
            expect( dump ).to.have.property( 'fromMail' ).and.be.ok;
            expect( dump ).to.have.property( 'toMail' ).and.equal( data.to.email );
            expect( dump ).to.have.property( 'usersCC' ).that.that.is.an( 'array' );
            expect( dump ).to.have.property( 'usersBCC' ).that.that.is.an( 'array' );
            expect( dump ).to.have.property( 'tplName' ).and.equal( 'default' );
            expect( dump ).to.have.property( 'tplTitle' ).and.equal( data.subject );
            expect( dump ).to.have.property( 'hasTemplate' ).and.equal( data.hasTemplate );

            expect( dump.usersCC ).to.have.length( data.cc.length );
            expect( dump.usersCC[0] ).to.equal( data.cc[0].email );
            expect( dump.usersCC[1] ).to.equal( data.cc[1].email );

            expect( dump.usersBCC ).to.have.length( data.bcc.length );
            expect( dump.usersBCC[0] ).to.equal( data.bcc[0].email );
            expect( dump.usersBCC[1] ).to.equal( data.bcc[1].email );

            expect( emailData.usersCC ).to.be.an( 'array' );
            expect( emailData.usersCC ).to.have.length( data.cc.length );
            expect( emailData.usersCC[0] ).to.be.an( 'object' );
            expect( emailData.usersCC[0] ).to.have.property( 'email' ).and.equal( data.cc[0].email );

            expect( emailData.usersBCC ).to.be.an( 'array' );
            expect( emailData.usersBCC ).to.have.length( data.bcc.length );
            expect( emailData.usersBCC[0] ).to.be.an( 'object' );
            expect( emailData.usersBCC[0] ).to.have.property( 'email' ).and.equal( data.bcc[0].email );

            expect( emailData.attachments ).to.be.an( 'array' );
            expect( emailData.attachments ).to.be.empty;

            expect( emailData.sender ).to.be.an( 'object' );
            expect( emailData.sender ).to.have.property( 'fullName' ).and.equal( [ data.userFirstName, data.userLastName ].join( ' ' ) );
            expect( emailData.sender ).to.have.property( 'email' ).and.be.ok;

            expect( emailData.survey ).to.not.be.ok;

            expect( emailData.hasTemplate ).to.equal( data.hasTemplate );

            done();
        } );

    } );

    describe( '.saveEmailAssociation( savedEmail, fData )', function () {

        before( function ( done ) {
            var users = []
              , promise = [];
            users[0] = { username: 'pavlick', email: 'pavlicl@mail.ru', password: '1234' };
            users[1] = { username: 'mishka', email: 'mishka@mail.ru', password: '1234' };
            users[2] = { username: 'vovka', email: 'vovka@mail.ru', password: '1234' };
            users[3] = { username: 'petka', email: 'petka@mail.ru', password: '1234' };

            users.forEach( function( user ) {
                promise.push( UserModel.create( user ) )
            });

            Q.all( promise )
                .then( function( users ) {
                    expect( users ).to.be.an( 'array' ).and.have.length( 4 );
                    expect( users[0] ).to.be.an( 'object' );
                    expect( users[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'username' ).and.equal( users[0].username );
                    expect( users[1] ).to.be.an( 'object' );
                    expect( users[1] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[1] ).to.have.property( 'username' ).and.equal( users[1].username );
                    expect( users[2] ).to.be.an( 'object' );
                    expect( users[2] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[2] ).to.have.property( 'username' ).and.equal( users[2].username );
                    expect( users[3] ).to.be.an( 'object' );
                    expect( users[3] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[3] ).to.have.property( 'username' ).and.equal( users[3].username );

                    userId_1 = users[0].id;
                    userId_2 = users[1].id;
                    userId_3 = users[2].id;
                    userId_4 = users[3].id;

                    done();
                })
                .fail( done );

        } );

        it( 'should be able to save email associations', function ( done ) {
            var data = {
                title: 'some title',
                subject: 'some subject',
                body: 'some body',
                userId: userId,
                accId: 1,
                to: {
                    id: 15,
                    email: 'to1@email.za'
                },
                hasTemplate: false,
                cc: [ { id: userId_1, email:'cc1@mail.ru' }, { id: userId_2, email: 'cc2@mail.ru' } ],
                bcc: [ { id: userId_3, email: 'bcc1@mail.com' }, { id: userId_4, email: 'bcc2@mail.com' } ],
                accLogo: 'LoGo',
                accName: 'Default Name',
                userFirstName: 'Dmitrij',
                userLastName: 'Safronov',
                EmailTemplateId: 45
            };

            var emailData = Service.formatData( data );

            Model
                .create( emailData.email )
                .success( function( email ) {

                    expect( email ).to.be.an( 'object' );
                    expect( email ).to.have.property( 'id' ).and.be.ok;
                    expect( email ).to.have.property( 'subject' ).and.equal( data.subject );

                    emailId_1 = email.id;
                    emailId_1_token = email.token

                    Service
                        .saveEmailAssociation( email, emailData )
                        .then( function( res ) {

                            EmailUserModel
                                .findAll( { where: { EmailId: email.id, UserId: userId_1 } } )
                                .success( function( res ) {

                                    expect( res ).to.be.an( 'array' ).and.have.length( 1 );
                                    expect( res[0] ).to.be.an( 'object' );
                                    expect( res[0] ).to.have.property( 'id' ).and.be.ok;
                                    expect( res[0] ).to.have.property( 'status' ).and.equal( 'cc' );

                                    EmailUserModel
                                        .findAll( { where: { EmailId: email.id, UserId: userId_4 } } )
                                        .success( function( res ) {

                                            expect( res ).to.be.an( 'array' ).and.have.length( 1 );
                                            expect( res[0] ).to.be.an( 'object' );
                                            expect( res[0] ).to.have.property( 'id' ).and.be.ok;
                                            expect( res[0] ).to.have.property( 'status' ).and.equal( 'bcc' );

                                            done();
                                        })
                                        .error( done );
                                })
                                .error( done );
                        })
                        .fail( done )

                })
        } );

    } );

    describe( '.processEmailCreation( emailItem )', function () {

        it( 'should be able to create email with associations', function ( done ) {
            var data = {
                title: 'some title #1',
                subject: 'some subject #1',
                body: 'some body #1',
                userId: userId,
                accId: 1,
                to: {
                    id: 15,
                    email: 'denshikov_vovan@mail.ru'
                },
                hasTemplate: false,
                cc: [ { id: userId_1, email:'cc1@mail.ru' }, { id: userId_2, email: 'cc2@mail.ru' } ],
                bcc: [ { id: userId_3, email: 'bcc1@mail.com' }, { id: userId_4, email: 'bcc2@mail.com' } ],
                accLogo: 'LoGo',
                accName: 'Default Name',
                userFirstName: 'Dmitrij',
                userLastName: 'Safronov',
                EmailTemplateId: 45
            };

            Service
                .processEmailCreation( data )
                .then( function() {

                    Model
                        .find( { where: { subject: data.subject, body: data.body } } )
                        .success( function( email ) {

                            expect( email ).to.be.an( 'object' );
                            expect( email ).to.have.property( 'id' ).and.be.ok;
                            expect( email ).to.have.property( 'subject' ).and.equal( data.subject );

                            emailId_2 = email.id;

                            EmailUserModel
                                .findAll( { where: { EmailId: email.id, UserId: userId_1 } } )
                                .success( function( res ) {

                                    expect( res ).to.be.an( 'array' ).and.have.length( 1 );
                                    expect( res[0] ).to.be.an( 'object' );
                                    expect( res[0] ).to.have.property( 'id' ).and.be.ok;
                                    expect( res[0] ).to.have.property( 'status' ).and.equal( 'cc' );

                                    EmailUserModel
                                        .findAll( { where: { EmailId: email.id, UserId: userId_4 } } )
                                        .success( function( res ) {

                                            expect( res ).to.be.an( 'array' ).and.have.length( 1 );
                                            expect( res[0] ).to.be.an( 'object' );
                                            expect( res[0] ).to.have.property( 'id' ).and.be.ok;
                                            expect( res[0] ).to.have.property( 'status' ).and.equal( 'bcc' );

                                            done();
                                        })
                                        .error( done );
                                })
                                .error( done );
                        })
                        .error( done );
                }, done )

        } );

    } );

    describe( '.handleEmailCreation( data )', function () {

        it( 'should be able to create emails with associations', function ( done ) {
            var email_1 = {
                title: 'some title #2',
                subject: 'some subject #2',
                body: 'some body #2',
                userId: userId,
                accId: 1,
                to: {
                    id: 15,
                    email: 'to1@email.za'
                },
                hasTemplate: false,
                cc: [ { id: userId_1, email:'cc1@mail.ru' }, { id: userId, email: 'cc2@mail.ru' } ],
                bcc: [ { id: userId_3, email: 'bcc1@mail.com' }, { id: userId_4, email: 'bcc2@mail.com' } ],
                accLogo: 'LoGo',
                accName: 'Default Name',
                userFirstName: 'Dmitrij',
                userLastName: 'Safronov',
                EmailTemplateId: 45
            };

            var email_2 = {
                title: 'some title #3',
                subject: 'some subject #3',
                body: 'some body #3',
                userId: 3,
                accId: 1,
                to: {
                    id: 15,
                    email: 'to1@email.za'
                },
                hasTemplate: false,
                cc: [ { id: userId_1, email:'cc1@mail.ru' }, { id: userId_2, email: 'cc2@mail.ru' } ],
                bcc: [ { id: userId_3, email: 'bcc1@mail.com' }, { id: userId_4, email: 'bcc2@mail.com' } ],
                accLogo: 'LoGo',
                accName: 'Default Name',
                userFirstName: 'Dmitrij',
                userLastName: 'Safronov',
                EmailTemplateId: 45
            };

            Service
                .handleEmailCreation( [ email_1, email_2 ] )
                .then( function() {

                    var promise = [
                        Model.find( { where: { subject: email_1.subject, body: email_1.body } } ),
                        Model.find( { where: { subject: email_2.subject, body: email_2.body } } )
                    ];

                    Q.all( promise )
                        .then( function( emails ) {

                            expect( emails ).to.be.an( 'array' ).and.have.length( 2 );

                            expect( emails[0] ).to.be.an( 'object' );
                            expect( emails[0] ).to.have.property( 'id' ).and.be.ok;
                            expect( emails[0] ).to.have.property( 'subject' ).and.equal( email_1.subject );

                            expect( emails[1] ).to.be.an( 'object' );
                            expect( emails[1] ).to.have.property( 'id' ).and.be.ok;
                            expect( emails[1] ).to.have.property( 'subject' ).and.equal( email_2.subject );

                            done();

                        }, done );
                }, done )
        } );

    } );

    describe( '.getEmailByIds( userId, emailId )', function () {

        it( 'should be able to find email by emailId for user with userId', function ( done ) {

            Service
                .getEmailByIds( userId, emailId_1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.contain.keys( 'emailAttachments' );

                    expect( result ).to.have.property( 'id' ).and.equal( emailId_1 );
                    expect( result ).to.have.property( 'subject' ).and.equal( 'some subject' );
                    expect( result ).to.have.property( 'body' ).and.equal( 'some body' );
                    expect( result ).to.have.property( 'isDelivered' ).and.equal( false );
                    expect( result ).to.have.property( 'sentAttemps' ).and.equal( 0 );
                    expect( result ).to.have.property( 'isOpened' ).and.equal( false );
                    expect( result ).to.have.property( 'token' ).and.be.ok;
                    expect( result ).to.have.property( 'EmailTemplateId' ).and.equal( 45 );
                    expect( result ).to.have.property( 'UserId' ).and.equal( userId );
                    expect( result ).to.have.property( 'AccountId' ).and.equal( 1 );
                    expect( result ).to.have.property( 'dump' ).and.be.ok;
                    expect( result.emailAttachments ).to.be.an( 'array' ).and.be.empty;

                    expect( result ).to.have.property( 'users' ).to.be.an( 'array' ).and.have.length( 4 );
                    expect( result.users[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result.users[0] ).to.have.property( 'status' ).and.be.ok;
                    expect( result.users[0] ).to.have.property( 'UserId' ).and.be.ok;
                    expect( result.users[0] ).to.have.property( 'EmailId' ).and.equal( emailId_1 );
                    expect( result.users[0].user ).to.be.an( 'object' ).and.not.be.empty;

                    done();
                }, done )
        } );

        it( 'should be able to get the error if the emailId does not exist', function ( done ) {

            Service
                .getEmailByIds( userId, 100000 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to get the error if email does not belong to the user', function ( done ) {

            Service
                .getEmailByIds( userId_1, emailId_1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

    } );

    describe( '.listEmails( userId )', function () {

        it( 'should be able to find all emails by userId', function ( done ) {

            Service
                .listEmails( userId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.not.empty;
                    expect( result ).to.have.length.above( 1 );

                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'subject' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'body' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'UserId' ).and.equal( userId );
                    expect( result[0] ).to.have.property( 'emailAttachments' ).and.be.an( 'array' ).and.be.empty;

                    done();
                }, done )
        } );

        it( 'should be able to give us an empty array if no emails for userId', function ( done ) {

            Service
                .listEmails( 10000 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.empty;

                    done();
                }, done )
        } );

    } );

    describe.skip( '.sendEmail( email, body, type )', function () {

        it( 'should be able to send email', function ( done ) {
            var data = {
                title: 'some title',
                subject: 'some subject',
                body: 'this is the test mail',
                userId: 1,
                accId: 1,
                to: {
                    id: 15,
                    email: 'denshikov_vovan@mail.ru'
                },
                hasTemplate: false,
                cc: [],
                bcc: [],
                accLogo: 'LoGo',
                accName: 'Default Name',
                userFirstName: 'Dmitrij',
                userLastName: 'Safronov',
                EmailTemplateId: 45
            };

            var email = Service.formatData( data ).email;

            Service
                .sendEmail( email, '<div>hi. it is the first email</div>', 'text' )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.is.not.empty;
                    expect( result ).to.have.length( 1 );
                    expect( result[0] ).to.have.property( 'status' ).and.equal( 'sent' );
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;

                    done();
                }, done )
        } );

    } );

    describe( '.handleEmailSending( userId, emailId, type )', function () {

        it.skip( 'should be able to send email', function ( done ) {

            var type = 'html';

            Service
                .handleEmailSending( userId, emailId_1, type )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.is.not.empty;
                    expect( result ).to.have.length.above( 1 );
                    expect( result[0] ).to.have.property( 'status' ).and.equal( 'sent' );
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to get the error if the emailId does not exist', function ( done ) {

            var type = 'html';

            Service
                .handleEmailSending( userId, 1000, type )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to give us an empty array if no emails for userId', function ( done ) {

            var type = 'html';

            Service
                .handleEmailSending( userId_1, emailId_1, type )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

    } );

    describe( '.deleteEmail( userId, emailId )', function () {

        it( 'should be able to get the error if the emailId does not exist', function ( done ) {

            Service
                .deleteEmail( userId, 151515 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Service
                        .findById( emailId_1 )
                        .then( function( email ) {

                            expect( email ).to.be.an( 'object' ).and.be.ok;
                            expect( email ).to.have.property( 'id' ).and.equal( emailId_1 );

                            done();
                        })
                        .fail( done );
                }, done )
        } );

        it( 'should be able to get the error if email does not belong to the user', function ( done ) {

            Service
                .deleteEmail( userId+15, emailId_1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Service
                        .findById( emailId_1 )
                        .then( function( email ) {

                            expect( email ).to.be.an( 'object' ).and.be.ok;
                            expect( email ).to.have.property( 'id' ).and.equal( emailId_1 );

                            done();
                        })
                        .fail( done );
                }, done )
        } );

        it( 'should be able to delete email by emailId for user with userId', function ( done ) {

            Service
                .deleteEmail( userId, emailId_1 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );

                    Service
                        .findById( emailId_1 )
                        .then( function( email ) {

                            expect( email ).to.not.be.ok;

                            done();
                        })
                        .fail( done );
                }, done )
        } );

    } );


} );