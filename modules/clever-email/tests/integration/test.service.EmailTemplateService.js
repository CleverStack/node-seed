var should = require( 'should' )
  , sinon = require( 'sinon' )
  , Q = require( 'q' )
  , testEnv = require( './utils' ).testEnv
  , EmailTemplateClass = require( 'services' ).EmailTemplateService;

describe( 'service.EmailTemplateService', function () {
    var EmailTemplateService, EmailTempalteModel, UserModel, user;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( db, models ) {

            EmailTemplateService = new EmailTemplateClass( db, models.ORM.EmailTemplate );
            EmailTempalteModel = models.ORM.EmailTemplate;
            UserModel = models.ORM.User;

            UserModel
                .create( {
                    username: 'joe@example.com', email: 'joe@example.com', password: '1234', AccountId: 1, RoleId: 1, TeamId: 1
                } )
                .success( function ( _user_ ) {
                    _user_.should.be.a( 'object' );
                    _user_.should.have.property( 'id' );
                    user = _user_;

                    done();
                } )
                .error( done );

        }, done );
    } );

    describe( '.formatData', function () {
        it( 'should return an object with filtered data', function ( done ) {
            var data = {
                title: 'some title', subject: 'some subject', body: 'some body', useDefault: false, permission: 'none', someattr: 'this attribute is not part of the model'
            };

            var emailData = EmailTemplateService.formatData( data )

            emailData.should.have.property( 'id', null );
            emailData.should.have.property( 'isActive', false );
            emailData.should.have.property( 'isDefault', false );

            emailData.should.not.have.property( 'someattr' );
            done();
        } );

    } );

    describe( '.handleEmailTemplateCreation', function () {

        it( 'should save a new email template with given options', function ( done ) {
            var emailTemplateData = {
                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false
            };

            EmailTemplateService
                .handleEmailTemplateCreation( user.AccountId, user.id, emailTemplateData )
                .then( function ( emailTemplate ) {

                    emailTemplate.should.have.property( 'id' );
                    emailTemplate.should.have.property( 'title', 'schedule interview' );

                    emailTemplate.should.have.property( 'AccountId', user.AccountId );
                    emailTemplate.should.have.property( 'UserId', user.id );

                    done();

                } )
                .fail( done );
        } );
    } );

    describe( '.handleEmailTemplateUpdate', function () {

        it( 'should return code 401 and a message if email template does not exist ', function ( done ) {
            var data = { id: 1233444444444444444444 };

            EmailTemplateService
                .handleEmailTemplateUpdate( user.AccountId, user.id, data )
                .then( function ( msg ) {

                    msg.should.be.a( 'object' );
                    msg.should.have.property( 'statuscode', 401 );
                    msg.should.have.property( 'message' ).and.not.be.empty;

                    done();

                } )
                .fail( done );

        } );

        it( 'should call .updateEmailTemplate ', function ( done ) {


            var emailTemplateData = {
                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false, AccountId: user.AccountId, UserId: user.id
            };

            var spyUpdateEmailTemplate = sinon.spy( EmailTemplateService, 'updateEmailTemplate' );

            EmailTempalteModel
                .create( emailTemplateData )
                .success( function ( emailTemplate ) {

                    emailTemplate.should.have.property( 'id' );
                    emailTemplate.should.have.property( 'title', 'schedule interview' );

                    EmailTemplateService
                        .handleEmailTemplateUpdate( user.AccountId, user.id, emailTemplate )
                        .then( function () {

                            spyUpdateEmailTemplate.called.should.be.true;
                            done();

                        } )
                        .fail( done );
                } )
                .error( done );
        } );
    } );

    describe( '.updateEmailTemplate', function () {

        it( 'should update an email Template record', function ( done ) {

            var emailTemplateData = {
                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false, AccountId: user.AccountId, UserId: user.id
            };

            var updatedData = {
                id: null, title: 'This is an updated title', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false
            };


            EmailTempalteModel
                .create( emailTemplateData )
                .success( function ( emailTemplate ) {

                    emailTemplate.should.have.property( 'title', 'schedule interview' );
                    updatedData['id'] = emailTemplate.id;

                    EmailTemplateService
                        .updateEmailTemplate( emailTemplate, updatedData )
                        .then( function ( updatedEmailTpl ) {

                            updatedEmailTpl.id.should.equal( emailTemplate.id );
                            updatedEmailTpl.title.should.not.equal( emailTemplateData.title );
                            updatedEmailTpl.title.should.equal( updatedData.title );

                            done();
                        } )
                        .fail( done );
                } )
                .error( done );
        } );
    } );

    describe( '.removeEmailTemplate', function () {

        it( 'should remove an email template record ', function ( done ) {

            var emailTemplateData = {
                title: 'schedule interview', subject: 'congradulations! we would love to meet you', body: 'Dear John Appleseed, <br/> we are interest by your skill set your qualifications for the job', useDefault: 'false', permission: 'none', isActive: true, useDefault: false, isDefault: false, AccountId: user.AccountId, UserId: user.id
            };


            EmailTempalteModel
                .create( emailTemplateData )
                .success( function ( emailTemplate ) {

                    emailTemplate.should.have.property( 'id' );
                    emailTemplate.should.have.property( 'title', 'schedule interview' );

                    EmailTemplateService
                        .removeEmailTemplate( user.id, emailTemplate.id )
                        .then( function ( msg ) {

                            msg.should.be.a( 'object' );
                            msg.should.have.property( 'statuscode', 200 );
                            msg.should.have.property( 'message' ).and.not.be.empty;

                            done();

                        } )
                        .fail( done );
                } )
                .error( done );
        } );

        it( 'should return code 400 and a message if email template does not exist ', function ( done ) {
            var tplId = '1233333333333333333333';

            EmailTemplateService
                .removeEmailTemplate( user.id, tplId )
                .then( function ( msg ) {

                    msg.should.be.a( 'object' );
                    msg.should.have.property( 'statuscode', 400 );
                    msg.should.have.property( 'message' ).and.not.be.empty;

                    done();

                } )
                .fail( done );
        } );
    } );
} );