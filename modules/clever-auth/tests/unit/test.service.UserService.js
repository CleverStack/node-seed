var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )
  , testEnv = require ( 'utils' ).testEnv()
  , sinon = require( 'sinon' )
  , Q = require ( 'q' );

var EmailService = null;

var user_1, user_1_json, old_password;

describe( 'service.UserService', function () {
    var UserService;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _UserService_, _ORMUserModel_ ) {

            UserService = _UserService_;
            UserModel = _ORMUserModel_;

            done();
        }, done );
    } );

    describe( '.authenticate( credentials )', function () {

        it( 'should return User with specified credentials', function ( done ) {
            var data1 = {
                username: 'Joe',
                email: 'joe@example.com',
                password: '1234'
            };
            var data2 = {
                username: 'Rachel',
                email: 'rachel@example.com',
                password: '1234'
            };

            UserService.create( data1 )
                .then( function () {
                    return UserService.create( data2 );
                } )
                .then( function () {
                    return UserService.authenticate( {
                        email: 'rachel@example.com',
                        password: '1234'
                    } )
                        .then( function ( user ) {

                            expect( user ).to.be.an( 'object' ).and.be.ok;
                            expect( user ).to.have.property( 'username' ).and.equal( data2.username );
                            expect( user ).to.have.property( 'email' ).and.equal( data2.email );
                            expect( user ).to.not.have.property( 'password' );

                            done();
                        } );
                } )
                .fail( done );
        } );

        it( 'should not return user when he is not active', function ( done ) {
            var data = {
                username: 'Joe3',
                email: 'joe3@example.com',
                password: '1234',
                active: false
            };

            UserService
                .create( data )
                .then( function () {
                    return UserService.authenticate( {
                        email: data.email,
                        password: data.password
                    } );

                } )
                .then( function ( user ) {

                    expect( user ).to.not.be.ok;

                    done();
                } )
                .fail( done );
        } );

        it( 'should set "accessedAt" property after successfull login', function ( done ) {

            var lastLogin = null
              , data = {
                    username: 'Joe5',
                    email: 'joe5@example.com',
                    password: '1234',
                    active: true
                };

            UserService
                .create( data )
                .then( function () {

                    return UserService.authenticate( {
                        email: data.email,
                        password: data.password
                    } );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                    lastLogin = user.accessedAt;

                    return lastLogin;
                } )
                .delay( 1000 )
                .then( function () {
                    return UserService.authenticate( {
                        email: data.email,
                        password: data.password
                    } );
                } )
                .then( function ( user ) {
                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'accessedAt' ).and.not.equal( lastLogin );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.getUserFullDataJson( options )', function () {

        it( 'should return User with specified options', function ( done ) {
            var data = {
                username: 'Rachel8',
                email: 'rachel8@example.com',
                password: '1234'
            };

            UserService.create( data )
                .then( function () {
                    return UserService.getUserFullDataJson( { email: data.email } );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );

                    done();
                } )
                .fail( done );
        } );

        it( 'should return null when options does not match in the db', function ( done ) {
            var data = {
                username: 'Rachel10',
                email: 'rachel10@example.com',
                password: '1234'
            };

            UserService.create( data )
                .then( function () {
                    return UserService.getUserFullDataJson( { email: 'noneExistedEmail2@somemail.com' } );
                } )
                .then( function ( user ) {

                    expect( user ).to.not.be.ok;

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.generatePasswordResetHash( user )', function () {

        it( 'should return data for user confirmation', function ( done ) {

            var data = {
                username: 'Rachel12',
                email: 'rachel12@example.com',
                password: '1234',
                confirmed: false
            };

            UserService
                .create( data )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;

                    //Properties needed for creating hash value
                    expect( user ).to.have.property( 'createdAt' ).and.be.ok;
                    expect( user ).to.have.property( 'updatedAt' ).and.be.ok;
                    expect( user ).to.have.property( 'password' ).and.be.ok;
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'confirmed' ).and.equal( data.confirmed );

                    return UserService.generatePasswordResetHash( user );
                } )
                .then( function ( recoverydata ) {

                    expect( recoverydata ).to.be.an( 'object' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'hash' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'expTime' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'user' ).and.be.ok;
                    expect( recoverydata.user ).to.be.an( 'object' ).and.be.ok;
                    expect( recoverydata.user ).to.have.property( 'id' ).and.be.ok;
                    expect( recoverydata.user ).to.have.property( 'fullName' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'action' ).and.be.ok;
                    expect( recoverydata.action ).to.be.an( 'string' ).and.include( 'confirm' );
                    expect( recoverydata ).to.have.property( 'mailsubject' ).and.be.ok;
                    expect( recoverydata.mailsubject ).to.be.an( 'string' ).and.include( 'Confirmation' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should return data for password recovery', function ( done ) {

            var data = {
                username: 'Rachel13',
                email: 'rachel13@example.com',
                password: '1234',
                confirmed: true,
                "AccountId": 1
            };

            UserService
                .create( data )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;

                    //Properties needed for creating hash value
                    expect( user ).to.have.property( 'createdAt' ).and.be.ok;
                    expect( user ).to.have.property( 'updatedAt' ).and.be.ok;
                    expect( user ).to.have.property( 'password' ).and.be.ok;
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'confirmed' ).and.equal( data.confirmed );

                    return UserService.generatePasswordResetHash( user );
                } )
                .then( function ( recoverydata ) {

                    expect( recoverydata ).to.be.an( 'object' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'hash' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'expTime' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'user' ).and.be.ok;
                    expect( recoverydata.user ).to.be.an( 'object' ).and.be.ok;
                    expect( recoverydata.user ).to.have.property( 'id' ).and.be.ok;
                    expect( recoverydata.user ).to.have.property( 'fullName' ).and.be.ok;
                    expect( recoverydata ).to.have.property( 'action' ).and.be.ok;
                    expect( recoverydata.action ).to.be.an( 'string' ).and.include( 'reset' );
                    expect( recoverydata ).to.have.property( 'mailsubject' ).and.be.ok;
                    expect( recoverydata.mailsubject ).to.be.an( 'string' ).and.include( 'Recovery' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should return status 403 and message when user missing fields', function ( done ) {
            var data = {
                username: 'Rachel13',
                email: 'rachel13@example.com',
                password: '1234'
            };

            UserService
                .generatePasswordResetHash( data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.an( 'string' ).and.be.ok;

                    done();
                } )
                .fail( done );
        } );

    } );

    describe.skip( '.mailPasswordRecoveryToken( obj )', function () {

        it( 'should return status 200 and a message for account confirmation action ', function ( done ) {
            var data =
                {
                    user: {
                        email: "email@mail.com",
                        id: "id",
                        fullName: "Jim Ioak"
                    },
                    hash: "some_valid_hash",
                    mailsubject: "some_valid_subject",
                    action: "account_confirm"
                };

            UserService
                .mailPasswordRecoveryToken( data )
                .then( function ( result ) {

                    should.exist( result );
                    result.should.be.a( 'object' );

                    result.should.have.property( 'statuscode', 200 );
                    result.should.have.property( 'message' );
                    done();
                } )
                .fail( done );

        } );

        it.skip( 'should return status 200 and a message for password recovery action ', function ( done ) {
            var data = {
                user: { email: "email@mail.com", id: "id", fullName: "Jim Ioak" }, hash: "some_valid_hash", mailsubject: "some_valid_subject", action: "password_reset_submit"
            };

            UserService
                .mailPasswordRecoveryToken( data )
                .then( function ( result ) {

                    should.exist( result );
                    result.should.be.a( 'object' );

                    result.should.have.property( 'statuscode', 200 );
                    result.should.have.property( 'message' );
                    done();
                } )
                .fail( done );
        } );

        it.skip( 'should return status 500 and a message for unrecognized action ', function ( done ) {
            var data = {
                user: { email: "email@mail.com", id: "id", fullName: "Jim Ioak" }, hash: "some_valid_hash", mailsubject: "some_valid_subject", action: "unrecognized_action"
            };

            UserService
                .mailPasswordRecoveryToken( data )
                .then( function ( result ) {
                    should.exist( result );
                    result.should.be.a( 'object' );

                    result.should.have.property( 'statuscode', 500 );
                    result.should.have.property( 'message' );

                    done();
                } )
                .fail( done );
        } );
    } );

    describe( '.createUser( data )', function () {

        before( function( done ) {
            try {

                EmailService = require( 'services' )['EmailService'];

                expect( EmailService ).to.be.ok;

            } catch ( err ) {

                expect( EmailService ).to.not.be.ok;

            }

            done();
        });

        it( 'should return status 400 and a message when user with email exists', function ( done ) {

            var data = {
                username: 'Rachel18',
                email: 'rachel18@example.com',
                password: '1234'
            };

            UserService
                .create( data )
                .then( function () {
                    return UserService.createUser( data );
                } )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.an( 'string' ).and.be.ok;

                    done();
                } )
                .fail( done );
        } );

        it( 'should call .savedNewUser method anytime', function ( done ) {
            sinon.spy( UserService, "saveNewUser" );

            var data = {
                username: 'Rachel20',
                email: 'rachel20@example.com',
                password: '1234',
                "AccountId": 1
            };

            UserService
                .createUser( data )
                .then( function () {

                    expect( UserService.saveNewUser.calledOnce ).to.be.true;

                    done();
                } )
                .fail( done );
        } );

        it( 'should call .generatePasswordResetHash method if EmailService exist and do not call otherwise', function ( done ) {
            sinon.spy( UserService, "generatePasswordResetHash" );

            var data = {
                username: 'Rachel21',
                email: 'rachel21@example.com',
                password: '1234'
            };

            UserService
                .createUser( data )
                .then( function () {

                    if ( EmailService !== null && config['clever-auth'].email_confirmation ) {

                        expect( UserService.generatePasswordResetHash.calledOnce ).to.be.true;

                        UserService
                            .generatePasswordResetHash
                            .restore();
                    } else {

                        expect( UserService.generatePasswordResetHash.calledOnce ).to.be.false;

                    }
                    done();
                } )
                .fail( done );
        } );

        it( 'should call .mailPasswordRecoveryToken method if EmailService exist and do not call otherwise', function ( done ) {
            this.timeout( 5000 );
            sinon.spy( UserService, "mailPasswordRecoveryToken" );

            var data = {
                username: 'Rachel22',
                email: 'rachel22@example.com',
                password: '1234'
            };

            UserService
                .createUser( data )
                .then( function () {

                    if ( EmailService !== null && config['clever-auth'].email_confirmation ) {

                        expect( UserService.mailPasswordRecoveryToken.calledOnce ).to.be.true;

                        UserService
                            .mailPasswordRecoveryToken
                            .restore();
                    } else {

                        expect( UserService.mailPasswordRecoveryToken.calledOnce ).to.be.false;

                    }
                    done();
                } )
                .fail( done );
        } );

        it( 'should return user object', function ( done ) {

            var data = {
                username: 'Rachel23',
                email: 'rachel23@example.com',
                password: '1234'
            };

            UserService
                .createUser( data )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'password' ).and.be.ok;

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.saveNewUser( data )', function () {

        it( 'should auto generate random password when password is not given', function ( done ) {
            var data = {
                username: 'rachel32@example.com',
                email: 'rachel32@example.com'
            };

            UserService
                .saveNewUser( data )
                .then( function ( newUser ) {

                    expect( newUser ).to.be.an( 'object' ).and.be.ok;
                    expect( newUser ).to.have.property( 'id' ).and.be.ok;
                    expect( newUser ).to.have.property( 'username' ).and.equal( data.username );
                    expect( newUser ).to.have.property( 'email' ).and.equal( data.email );
                    expect( newUser ).to.have.property( 'password' ).and.be.ok;

                    return UserModel.find( { where: { email: data.email } } );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'password' ).and.be.ok;

                    done();
                } )
                .fail( done );
        } );

        it( 'should hash password when password is given', function ( done ) {

            var data = {
                username: 'rachel33@example.com',
                email: 'rachel33@example.com',
                password: '123'
            };

            UserService
                .saveNewUser( data )
                .then( function ( newUser ) {

                    expect( newUser ).to.be.an( 'object' ).and.be.ok;
                    expect( newUser ).to.have.property( 'id' ).and.be.ok;
                    expect( newUser ).to.have.property( 'username' ).and.equal( data.username );
                    expect( newUser ).to.have.property( 'email' ).and.equal( data.email );
                    expect( newUser ).to.have.property( 'password' ).and.be.ok;

                    return UserModel.find( { where: { email: data.email } } );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'password' ).and.not.equal( '123' );
                    expect( user.password.length ).to.be.ok.and.be.above( '123'.length );

                    done();
                } )
                .fail( done );
        } );

        it( 'should return a new user object', function ( done ) {
            var data = {
                username: 'rachel34@example.com',
                email: 'rachel34@example.com',
                password: '123'
            };

            UserService
                .saveNewUser( data )
                .then( function ( newUser ) {

                    expect( newUser ).to.be.an( 'object' ).and.be.ok;
                    expect( newUser ).to.have.property( 'id' ).and.be.ok;
                    expect( newUser ).to.have.property( 'username' ).and.equal( data.username );
                    expect( newUser ).to.have.property( 'email' ).and.equal( data.email );
                    expect( newUser ).to.have.property( 'password' ).and.be.ok;

                    return UserModel.find( { where: { email: data.email } } );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( data.username );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'password' ).and.be.ok;

                    user_1 = user;
                    user_1_json = user.toJSON();

                    done();
                } )
                .fail( done );

        } );

    } );

    describe( '.updateUser( user, data )', function () {

        it( 'should be able to update firstname, lastname, email, phone and do not update other', function ( done ) {
            var data = {
                firstname: 'mishka',
                lastname: 'mikhajlov',
                email: 'qwqwqw@mail.ru',
                phone: '845848485',

                username: 'vasjok',
                confirmed: true,
                active: false
            };

            UserService
                .updateUser( user_1, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( user_1_json.id );

                    return UserModel.find( user_1.id );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.equal( user_1_json.id );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'firstname' ).and.equal( data.firstname );
                    expect( user ).to.have.property( 'lastname' ).and.equal( data.lastname );
                    expect( user ).to.have.property( 'phone' ).and.equal( data.phone );

                    expect( user ).to.have.property( 'username' ).and.not.equal( data.username );
                    expect( user.username ).to.equal( user_1_json.username );
                    expect( user ).to.have.property( 'confirmed' ).and.not.equal( data.confirmed );
                    expect( user.confirmed ).to.equal( user_1_json.confirmed );
                    expect( user ).to.have.property( 'active' ).and.not.equal( data.active );
                    expect( user.active ).to.equal( user_1_json.active );

                    user_1_json = user.toJSON();

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.checkEmailAndUpdate( user, data )', function () {

        it( 'should return status 400 and a message when user with email exists', function ( done ) {
            var data = {
                email: 'rachel32@example.com'
            };

            UserService
                .checkEmailAndUpdate( user_1, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.an( 'string' ).and.be.ok;

                    return UserModel.find( user_1.id );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.equal( user_1.id );
                    expect( user ).to.have.property( 'email' ).and.equal( user_1.email );

                    done();
                } )
                .fail( done );
        } );

        it( 'should be able to update email ', function ( done ) {
            var data = {
                email: 'rachel152@example.com'
            };

            UserService
                .checkEmailAndUpdate( user_1, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( user_1.id );

                    return UserModel.find( user_1.id );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.equal( user_1_json.id );
                    expect( user ).to.have.property( 'username' ).and.equal( user_1_json.username );
                    expect( user ).to.have.property( 'email' ).and.not.equal( user_1_json.email );
                    expect( user.email ).to.equal( data.email );

                    user_1_json = user.toJSON();

                    done();
                } )
                .fail( done );
        } );

        it( 'should be able to update firstname, lastname, email, phone and do not update other', function ( done ) {
            var data = {
                firstname: 'firstname',
                lastname: 'lastname',
                email: 'qqq@mail.ru',
                phone: '09548848',

                username: 'vasjok',
                confirmed: true,
                active: false
            };

            UserService
                .checkEmailAndUpdate( user_1, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( user_1_json.id );

                    return UserModel.find( user_1.id );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.equal( user_1_json.id );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'firstname' ).and.equal( data.firstname );
                    expect( user ).to.have.property( 'lastname' ).and.equal( data.lastname );
                    expect( user ).to.have.property( 'phone' ).and.equal( data.phone );

                    expect( user ).to.have.property( 'username' ).and.not.equal( data.username );
                    expect( user ).to.have.property( 'confirmed' ).and.not.equal( data.confirmed );
                    expect( user ).to.have.property( 'active' ).and.not.equal( data.active );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.handleUpdateUser( userId, data )', function () {

        it( 'should return status 403 and a message when user with userId do not exists', function ( done ) {
            var data = {
                firstname: 'qwqwqw',
                lastname: 'ererere'
            };

            UserService
                .handleUpdateUser( 1515151515, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.an( 'string' ).and.be.ok;

                    done();
                } )
                .fail( done );
        } );

        it( 'should return status 403 and a message if old password incorrect', function ( done ) {
            var data = {
                firstname: 'qwqwqw',
                lastname: 'ererere',
                email: 'xcxcxcxcx@mail.ru',
                phone: '545454545',
                password: '1223345',
                new_password: '15151515'
            };

            UserService
                .handleUpdateUser( user_1.id, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.an( 'string' ).and.be.ok;

                    return UserModel.find( user_1.id );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.equal( user_1.id );
                    expect( user ).to.have.property( 'firstname' ).and.not.equal( data.firstname );
                    expect( user ).to.have.property( 'lastname' ).and.not.equal( data.lastname );
                    expect( user ).to.have.property( 'email' ).and.not.equal( data.email );
                    expect( user ).to.have.property( 'phone' ).and.not.equal( data.phone );

                    old_password = user.password;

                    done();
                } )
                .fail( done );
        } );

        it( 'should hash password and update it', function ( done ) {
            var data = {
                firstname: 'qwqwqw',
                lastname: 'ererere',
                email: 'xcxcxcxcx@mail.ru',
                phone: '545454545',
                password: '123',
                new_password: '321'
            };

            expect( user_1.password ).to.equal( old_password );

            UserService
                .handleUpdateUser( user_1.id, data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( user_1_json.id );

                    return UserModel.find( user_1.id );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.equal( user_1.id );
                    expect( user ).to.have.property( 'firstname' ).and.equal( data.firstname );
                    expect( user ).to.have.property( 'lastname' ).and.equal( data.lastname );
                    expect( user ).to.have.property( 'email' ).and.equal( data.email );
                    expect( user ).to.have.property( 'phone' ).and.equal( data.phone );
                    expect( user ).to.have.property( 'password' ).and.not.equal( old_password );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe.skip( '.resendAccountConfirmation( me, userId )', function () {
        it( 'should return status code 403 and message when user id does not exist', function ( done ) {
            var userId = 'noneExistedId'
              , accId = 1;

            UserService
                .resendAccountConfirmation( accId, userId )
                .then( function ( data ) {
                    should.exist( data );

                    data.should.be.a( 'object' );
                    data.should.have.property( 'statuscode', 403 );
                    data.should.have.property( 'message' ).and.not.be.empty;
                    done();
                } )

        } );

        it( 'should return status code 403 and message when account ids do not match', function ( done ) {
            var newuser = {
                    username: 'rachel35@example.com',
                    email: 'rachel35@example.com',
                    password: '123',
                    "AccountId": 1
                }
                , accId = 2;


            UserService
                .create( newuser )
                .then( function ( user ) {
                    return UserService.resendAccountConfirmation( accId, user );
                } )
                .then( function ( data ) {
                    should.exist( data );

                    data.should.be.a( 'object' );
                    data.should.have.property( 'statuscode', 403 );
                    data.should.have.property( 'message' ).and.not.be.empty;
                    done();
                } )
                .fail( done );
        } );

        it( 'should return status code 403 and message when account has been confirmed', function ( done ) {
            var newuser = {
                    username: 'rachel36@example.com',
                    email: 'rachel36@example.com',
                    password: '123',
                    confirmed: true,
                    "AccountId": 1
                }
                , accId = 1;


            UserService
                .create( newuser )
                .then( function ( user ) {
                    return UserService.resendAccountConfirmation( accId, user );
                } )
                .then( function ( data ) {
                    should.exist( data );

                    data.should.be.a( 'object' );
                    data.should.have.property( 'statuscode', 403 );
                    data.should.have.property( 'message' ).and.not.be.empty;
                    done();
                } )
                .fail( done );
        } );

        it( 'should call .generatePasswordResetHash method ', function ( done ) {
            sinon.spy( UserService, "generatePasswordResetHash" );

            var newuser = {
                    username: 'rachel363@example.com',
                    email: 'rachel363@example.com',
                    password: '123',
                    confirmed: false,
                    "AccountId": 1
                }
                , accId = 1;


            UserService
                .create( newuser )
                .then( function ( user ) {
                    return UserService.resendAccountConfirmation( accId, user.id );
                } )
                .then( function ( data ) {

                    UserService
                        .generatePasswordResetHash
                        .calledOnce
                        .should
                        .be
                        .true;

                    UserService
                        .generatePasswordResetHash
                        .restore();

                    done();
                } )
                .fail( done );
        } );

        it( 'should call .mailPasswordRecoveryToken method ', function ( done ) {
            sinon.spy( UserService, "mailPasswordRecoveryToken" );

            var newuser = {
                    username: 'rachel37@example.com',
                    email: 'rachel37@example.com',
                    password: '123',
                    confirmed: false,
                    "AccountId": 1
                }
                , accId = 1;


            UserService
                .create( newuser )
                .then( function ( user ) {
                    return UserService.resendAccountConfirmation( accId, user.id );
                } )
                .then( function ( data ) {

                    UserService
                        .mailPasswordRecoveryToken
                        .calledOnce
                        .should
                        .be
                        .true;

                    UserService
                        .mailPasswordRecoveryToken
                        .restore();

                    done();
                } )
                .fail( done );
        } );

        it( 'should return statuscode 200 and a message', function ( done ) {

            var newuser = {
                    username: 'rachel38@example.com',
                    email: 'rachel38@example.com',
                    password: '123',
                    confirmed: false,
                    "AccountId": 1
                }
                , accId = 1;


            UserService
                .create( newuser )
                .then( function ( user ) {
                    return UserService.resendAccountConfirmation( accId, user.id );
                } )
                .then( function ( data ) {

                    should.exist( data );

                    data.should.have.property( 'statuscode', 200 );
                    data.should.have.property( 'message' ).and.not.be.empty;

                    done();
                } )
                .fail( done );


        } );

    } );
} );