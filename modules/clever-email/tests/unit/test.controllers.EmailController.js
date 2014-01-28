// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , Service;

var userId = 1000, emailId;

describe( 'controllers.EmailController', function () {
    var ctrl;

    before( function ( done ) {
        testEnv( function ( EmailController, EmailService ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            ctrl = new EmailController( req, res, next );

            Service = EmailService;

            done();
        } );
    } );


    describe( '.postAction()', function () {

        it( 'should be able to create emails with associations', function ( done ) {

            var email_1 = {
                title: 'some title #2',
                subject: 'some subject #2',
                body: 'some body #2',
                to: {
                    id: 15,
                    email: 'denshikov_vovan@mail.ru'
                },
                hasTemplate: false,
                cc: [ { id: 1500, email:'cc1@mail.ru' }, { id: userId, email: 'cc2@mail.ru' } ],
                bcc: [ { id: 1600, email: 'bcc1@mail.com' }, { id: 1700, email: 'bcc2@mail.com' } ],
                EmailTemplateId: 45
            };

            var email_2 = {
                title: 'some title #3',
                subject: 'some subject #3',
                body: 'some body #3',
                to: {
                    id: 15,
                    email: 'to1@email.za'
                },
                hasTemplate: false,
                cc: [ { id: 1500, email:'cc1@mail.ru' }, { id: 1800, email: 'cc2@mail.ru' } ],
                bcc: [ { id: 1600, email: 'bcc1@mail.com' }, { id: 1700, email: 'bcc2@mail.com' } ],
                EmailTemplateId: 45
            };


            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                var promise = [
                    Service.find( { where: { subject: email_1.subject, body: email_1.body } } ),
                    Service.find( { where: { subject: email_2.subject, body: email_2.body } } )
                ];

                Q.all( promise )
                    .then( function ( emails ) {

                        emails[0] = emails[0][0];
                        emails[1] = emails[1][0];

                        expect( emails ).to.be.an( 'array' ).and.have.length( 2 );

                        expect( emails[0] ).to.be.an( 'object' );
                        expect( emails[0] ).to.have.property( 'id' ).and.be.ok;
                        expect( emails[0] ).to.have.property( 'subject' ).and.equal( email_1.subject );

                        expect( emails[1] ).to.be.an( 'object' );
                        expect( emails[1] ).to.have.property( 'id' ).and.be.ok;
                        expect( emails[1] ).to.have.property( 'subject' ).and.equal( email_2.subject );

                        emailId = emails[0].id;

                        done();

                    }, done );
            };
            ctrl.req.body = [ email_1, email_2 ];
            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };
            ctrl.postAction();
        } );

    } );

    describe( '.listAction()', function () {

        it( 'should be able to find all emails by userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.not.empty;
                expect( result ).to.have.length.above( 1 );

                expect( result[0] ).to.be.an( 'object' );
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                expect( result[0] ).to.have.property( 'subject' ).and.be.ok;
                expect( result[0] ).to.have.property( 'body' ).and.be.ok;
                expect( result[0] ).to.have.property( 'UserId' ).and.equal( userId );
                expect( result[0] ).to.have.property( 'emailAttachments' ).and.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.listAction();
        } );

        it( 'should be able to give us an empty array if no emails for userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.user = {
                id: userId+1000,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.listAction();
        } );

    } );

    describe( '.getAction()', function () {

        it( 'should be able to find email bu emailId for user with userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' );
                expect( result ).to.contain.keys( 'emailAttachments' );

                expect( result ).to.have.property( 'id' ).and.equal( emailId );
                expect( result ).to.have.property( 'subject' ).and.equal( 'some subject #2' );
                expect( result ).to.have.property( 'body' ).and.equal( 'some body #2' );
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
                expect( result.users[0] ).to.have.property( 'EmailId' ).and.equal( emailId );

                done();
            };

            ctrl.req.params = { id: emailId };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if the emailId does not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 151515 };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if email does not belong to the user', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: emailId };

            ctrl.req.user = {
                id: 1212,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.getAction();
        } );

    } );

    describe( '.putAction()', function () {

        it( 'should be able to get the error if we call the putAction', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.putAction();
        } );

    } );

    describe( '.sendAction()', function () {

        it.skip( 'should be able to send email', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.is.not.empty;
                expect( result ).to.have.length.above( 1 );
                expect( result[0] ).to.have.property( 'status' ).and.equal( 'sent' );
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: emailId };

            ctrl.req.body = { type: 'html' };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id: 1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.sendAction();
        } );

        it( 'should be able to get the error if the emailId does not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 15151515151515 };

            ctrl.req.body = { type: 'html' };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id: 1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.sendAction();
        } );

        it( 'should be able to give us an empty array if no emails for userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: emailId };

            ctrl.req.body = { type: 'html' };

            ctrl.req.user = {
                id: userId + 10,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id: 1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.sendAction();
        } );

    } );

    describe( '.deleteAction()', function () {

        it( 'should be able to get the error if the emailId does not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 15151515515 };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to get the error if email does not belong to the user', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: emailId };

            ctrl.req.user = {
                id: userId + 10,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to delete email by emailId for user with userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: emailId };

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1,
                    logo: 'LOGO',
                    name: "AccountName"
                }
            };

            ctrl.deleteAction();
        } );

    } );


} );