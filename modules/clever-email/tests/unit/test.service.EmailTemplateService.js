var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , testEnv = require ( 'utils' ).testEnv();

describe( 'service.EmailTemplateService', function () {
    var Service, Model, UserModel, user;

    before( function ( done ) {
        testEnv( function ( EmailTemplateService, EmailTemplateModel, UserModel ) {

            Service = EmailTemplateService;
            Model = EmailTemplateModel;
            UserModel = UserModel;

            done();

        }, done );
    } );

    describe( '.formatData', function () {
        it( 'should return an object with filtered data', function ( done ) {

            var data = {
                title: 'some title',
                subject: 'some subject',
                body: 'some body',
                accId: 15,
                userId: 5,
                useDefault: true,
                permission: 'none',
                someattr: 'this attribute is not part of the model'
            };

            var emailData = Service.formatData( data );

            expect( emailData ).to.have.property( 'id' ).and.equal( null );
            expect( emailData ).to.have.property( 'title' ).and.equal( data.title );
            expect( emailData ).to.have.property( 'subject' ).and.equal( data.subject );
            expect( emailData ).to.have.property( 'body' ).and.equal( data.body );
            expect( emailData ).to.have.property( 'AccountId' ).and.equal( data.accId );
            expect( emailData ).to.have.property( 'UserId' ).and.equal( data.userId );
            expect( emailData ).to.have.property( 'isActive' ).and.equal( false );
            expect( emailData ).to.have.property( 'isDefault' ).and.equal( false );
            expect( emailData ).to.have.property( 'useDefault' ).and.equal( true );
            expect( emailData ).to.have.property( 'hasPermission' ).and.equal( true );

            expect( emailData ).to.not.have.property( 'permission' );
            expect( emailData ).to.not.have.property( 'someattr' );

            done();
        } );

    } );

//    describe( '.handleEmailTemplateUpdate', function () {
//
//        it( 'should return code 401 and a message if email template does not exist ', function ( done ) {
//            var data = { id: 1233444444444444444444 };
//
//            EmailTemplateService
//                .handleEmailTemplateUpdate( user.AccountId, user.id, data )
//                .then( function ( msg ) {
//
//                    msg.should.be.a( 'object' );
//                    msg.should.have.property( 'statuscode', 401 );
//                    msg.should.have.property( 'message' ).and.not.be.empty;
//
//                    done();
//
//                } )
//                .fail( done );
//
//        } );
//
//        it( 'should call .updateEmailTemplate ', function ( done ) {
//
//
//            var emailTemplateData = {
//                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false, AccountId: user.AccountId, UserId: user.id
//            };
//
//            var spyUpdateEmailTemplate = sinon.spy( EmailTemplateService, 'updateEmailTemplate' );
//
//            EmailTempalteModel
//                .create( emailTemplateData )
//                .success( function ( emailTemplate ) {
//
//                    emailTemplate.should.have.property( 'id' );
//                    emailTemplate.should.have.property( 'title', 'schedule interview' );
//
//                    EmailTemplateService
//                        .handleEmailTemplateUpdate( user.AccountId, user.id, emailTemplate )
//                        .then( function () {
//
//                            spyUpdateEmailTemplate.called.should.be.true;
//                            done();
//
//                        } )
//                        .fail( done );
//                } )
//                .error( done );
//        } );
//    } );
//
//    describe( '.updateEmailTemplate', function () {
//
//        it( 'should update an email Template record', function ( done ) {
//
//            var emailTemplateData = {
//                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false, AccountId: user.AccountId, UserId: user.id
//            };
//
//            var updatedData = {
//                id: null, title: 'This is an updated title', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false
//            };
//
//
//            EmailTempalteModel
//                .create( emailTemplateData )
//                .success( function ( emailTemplate ) {
//
//                    emailTemplate.should.have.property( 'title', 'schedule interview' );
//                    updatedData['id'] = emailTemplate.id;
//
//                    EmailTemplateService
//                        .updateEmailTemplate( emailTemplate, updatedData )
//                        .then( function ( updatedEmailTpl ) {
//
//                            updatedEmailTpl.id.should.equal( emailTemplate.id );
//                            updatedEmailTpl.title.should.not.equal( emailTemplateData.title );
//                            updatedEmailTpl.title.should.equal( updatedData.title );
//
//                            done();
//                        } )
//                        .fail( done );
//                } )
//                .error( done );
//        } );
//    } );
//
//    describe( '.removeEmailTemplate', function () {
//
//        it( 'should remove an email template record ', function ( done ) {
//
//            var emailTemplateData = {
//                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false, AccountId: user.AccountId, UserId: user.id
//            };
//
//
//            EmailTempalteModel
//                .create( emailTemplateData )
//                .success( function ( emailTemplate ) {
//
//                    emailTemplate.should.have.property( 'id' );
//                    emailTemplate.should.have.property( 'title', 'schedule interview' );
//
//                    EmailTemplateService
//                        .removeEmailTemplate( user.id, emailTemplate.id )
//                        .then( function ( msg ) {
//
//                            msg.should.be.a( 'object' );
//                            msg.should.have.property( 'statuscode', 200 );
//                            msg.should.have.property( 'message' ).and.not.be.empty;
//
//                            done();
//
//                        } )
//                        .fail( done );
//                } )
//                .error( done );
//        } );
//
//        it( 'should return code 400 and a message if email template does not exist ', function ( done ) {
//            var tplId = '1233333333333333333333';
//
//            EmailTemplateService
//                .removeEmailTemplate( user.id, tplId )
//                .then( function ( msg ) {
//
//                    msg.should.be.a( 'object' );
//                    msg.should.have.property( 'statuscode', 400 );
//                    msg.should.have.property( 'message' ).and.not.be.empty;
//
//                    done();
//
//                } )
//                .fail( done );
//        } );
//    } );
} );