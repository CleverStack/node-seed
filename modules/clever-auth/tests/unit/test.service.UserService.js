var should = require( 'should' )
  , sinon = require( 'sinon' )
  , Q = require( 'q' )
  , testEnv = require( './utils' ).testEnv;

describe( 'service.UserService', function () {
    var UserService;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _UserService_ ) {
            UserService = _UserService_;
            done();
        }, done );
    } );

    describe( '.authenticate(credentials)', function () {
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
                            user.username.should.equal( data2.username );
                            done();
                        } );
                } )
                .fail( done );
        } );

        it( 'should return User with "account", "role" and "team" properties', function ( done ) {
            var data = {
                username: 'Rachel2',
                email: 'rachel2@example.com',
                password: '1234'
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
                    user.username.should.equal( data.username );

                    user.should.have.property( 'account' );
                    user.should.have.property( 'role' );
                    user.should.have.property( 'team' );

                    done();
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
                    should.not.exist( user );

                    done();
                } )
                .fail( done );
        } );

        it( 'should not return user when he is not active', function ( done ) {
            var data = {
                username: 'Joe4',
                email: 'joe4@example.com',
                password: '1234',
                active: false
            };

            UserService
                .create( data )
                .then( function () {
                    return UserService.authenticate( {
                        email: 'noneExistedEmail@somemail.com',
                        password: data.password
                    } );

                } )
                .then( function ( user ) {
                    should.not.exist( user );

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
                    user.should.have.property( 'accessedAt' );
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
                    user.should.have.property( 'accessedAt' );
                    user.accessedAt.should.not.equal( lastLogin );

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
                    user.email.should.equal( data.email );
                    done();
                } )
                .fail( done );
        } );

        it( 'should return User with "account", "role" and "team" properties', function ( done ) {
            var data = {
                username: 'Rachel9',
                email: 'rachel9@example.com',
                password: '1234',
                "AccountId": null,
                "RoleId": null,
                "TeamId": null
            };

            UserService.create( data )
                .then( function () {
                    return UserService.getUserFullDataJson( { email: data.email } );
                } )
                .then( function ( user ) {
                    user.email.should.equal( data.email );

                    user.should.have.property( 'account' );
                    should.not.exist( user.account );

                    user.should.have.property( 'role' );
                    should.not.exist( user.role );

                    user.should.have.property( 'team' );
                    should.not.exist( user.team );

                    done();
                } )
                .fail( done );
        } );

        it( 'should return null when options does not match in the db', function ( done ) {
            var data = {
                username: 'Rachel10',
                email: 'rachel10@example.com',
                password: '1234',
                "AccountId": null,
                "RoleId": null,
                "TeamId": null
            };

            UserService.create( data )
                .then( function () {
                    return UserService.getUserFullDataJson( { email: 'noneExistedEmail2@somemail.com' } );
                } )
                .then( function ( user ) {
                    should.not.exist( user );

                    done();
                } )
                .fail( done );
        } );
    } );

    describe( '.generatePasswordResetHash( user )', function () {
        it( 'should return data for account confirmation', function ( done ) {

            var data = {
                username: 'Rachel12',
                email: 'rachel12@example.com',
                password: '1234',
                confirmed: false,
                "AccountId": 1
            };

            UserService
                .create( data )
                .then( function ( user ) {
                    should.exist( user );
                    //Properties needed for creating hash value
                    user.should.have.property( 'createdAt' );
                    user.should.have.property( 'updatedAt' );
                    user.should.have.property( 'password' );
                    user.should.have.property( 'email' );
                    user.should.have.property( 'AccountId' );

                    return UserService.generatePasswordResetHash( user );
                } )
                .then( function ( recoverydata ) {
                    recoverydata.should.be.a( 'object' );

                    recoverydata.should.have.property( 'hash' );
                    should.exist( recoverydata.hash );

                    recoverydata.should.have.property( 'expTime' );
                    should.exist( recoverydata.expTime );

                    recoverydata.should.have.property( 'user' );
                    recoverydata.user.should.be.a( 'object' );
                    should.exist( recoverydata.user.id );
                    should.exist( recoverydata.user.fullName );

                    recoverydata.should.have.property( 'action' );
                    recoverydata.action.should.be.a( 'string' ).and.include( 'confirm' );

                    recoverydata.should.have.property( 'mailsubject' );
                    recoverydata.mailsubject.should.be.a( 'string' ).and.include( 'Confirmation' );

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
                    should.exist( user );
                    //Properties needed for creating hash value
                    user.should.have.property( 'createdAt' );
                    user.should.have.property( 'updatedAt' );
                    user.should.have.property( 'password' );
                    user.should.have.property( 'email' );
                    user.should.have.property( 'AccountId' );

                    return UserService.generatePasswordResetHash( user );
                } )
                .then( function ( recoverydata ) {
                    recoverydata.should.be.a( 'object' );

                    recoverydata.should.have.property( 'hash' );
                    should.exist( recoverydata.hash );

                    recoverydata.should.have.property( 'expTime' );
                    should.exist( recoverydata.expTime );

                    recoverydata.should.have.property( 'user' );
                    recoverydata.user.should.be.a( 'object' );
                    should.exist( recoverydata.user.id );
                    should.exist( recoverydata.user.fullName );

                    recoverydata.should.have.property( 'action' );
                    recoverydata.action.should.be.a( 'string' ).and.include( 'reset' );

                    recoverydata.should.have.property( 'mailsubject' );
                    recoverydata.mailsubject.should.be.a( 'string' ).and.include( 'Recovery' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should return status 403 and message when user missing fields', function ( done ) {
            var data = {
                username: 'Rachel13',
                email: 'rachel13@example.com',
                password: '1234',
            };

            UserService
                .generatePasswordResetHash( data )
                .then( function ( data ) {

                    data.should.have.property( 'statuscode' );
                    data.statuscode.should.equal( 403 );

                    data.should.have.property( 'message' );
                    data.message.should.be.a( 'string' ).and.not.be.empty;

                    done();
                } )
                .fail( done );
        } );
    } );

    describe( '.mailPasswordRecoveryToken( obj )', function () {
        it( 'should return status 200 and a message for account confirmation action ', function ( done ) {
            var data = {
                user: { email: "email@mail.com", id: "id", fullName: "Jim Ioak" }, hash: "some_valid_hash", mailsubject: "some_valid_subject", action: "account_confirm"
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

        it( 'should return status 200 and a message for password recovery action ', function ( done ) {
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

        it( 'should return status 500 and a message for unrecognized action ', function ( done ) {
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

                    result.should.be.a( 'object' );

                    result.should.have.property( 'statuscode', 400 );
                    result.should.have.property( 'message' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should call .savedNewUser method ', function ( done ) {
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

                    UserService
                        .saveNewUser
                        .calledOnce
                        .should
                        .be
                        .true;

                    done();
                } )
                .fail( done );
        } );


        it( 'should call .generatePasswordResetHash method ', function ( done ) {
            sinon.spy( UserService, "generatePasswordResetHash" );

            var data = {
                username: 'Rachel21',
                email: 'rachel21@example.com',
                password: '1234',
                "AccountId": 1
            };

            UserService
                .createUser( data )
                .then( function () {

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
            this.timeout( 5000 );
            sinon.spy( UserService, "mailPasswordRecoveryToken" );

            var data = {
                username: 'Rachel22',
                email: 'rachel22@example.com',
                password: '1234',
                "AccountId": 1
            };

            UserService
                .createUser( data )
                .then( function () {

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

        it( 'should return status 200 and user object', function ( done ) {

            var data = {
                username: 'Rachel23',
                email: 'rachel23@example.com',
                password: '1234',
                "AccountId": 1
            };

            UserService
                .createUser( data )
                .then( function ( data ) {

                    should.exist( data );
                    data.should.be.a( 'object' );

                    data.should.have.property( 'id' );
                    data.should.have.property( 'username' ).and.equal( data.username );
                    data.should.have.property( 'AccountId' ).and.equal( data.AccountId );

                    done();
                } )
                .fail( done );
        } );
    } );

    describe( '.saveNewUser( data )', function () {
        it( 'should return statuscode 403 and message when account id is missing', function ( done ) {

            var data = {
                username: 'rachel31@example.com',
                email: 'rachel31@example.com',
                password: '1234'
            };

            UserService
                .saveNewUser( data )
                .then( function ( result ) {

                    result.should.be.a( 'object' );

                    result.should.have.property( 'statuscode', 403 );
                    result.should.have.property( 'message' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should auto generate random password when password is not given', function ( done ) {
            var data = {
                username: 'rachel32@example.com',
                email: 'rachel32@example.com',
                "AccountId": 1
            };

            UserService
                .saveNewUser( data )
                .then( function () {
                    return UserService.find( {
                        where: { email: data.email }
                    } );
                } )
                .then( function ( user ) {
                    user.should.be.instanceOf( Array );
                    user[0].should.be.a( 'object' );
                    user[0].should.have.property( 'email', data.email );
                    user[0].should.have.property( 'id' );

                    user[0].should.have.property( 'password' ).and.not.be.empty;
                    done();
                } )
                .fail( done );
        } );

        it( 'should hash password when password is given', function ( done ) {

            var data = {
                username: 'rachel33@example.com',
                email: 'rachel33@example.com',
                password: '123',
                "AccountId": 1
            };

            UserService
                .saveNewUser( data )
                .then( function () {
                    return UserService.find( {
                        where: { email: data.email }
                    } );
                } )
                .then( function ( user ) {
                    user.should.be.instanceOf( Array );
                    user[0].should.be.a( 'object' );
                    user[0].should.have.property( 'email', data.email );
                    user[0].should.have.property( 'id' );

                    user[0].should.have.property( 'password' );
                    user[0].password.should.not.equal( '123' );
                    user[0].password.length.should.be.above( '123'.length );
                    done();
                } )
                .fail( done );
        } );

        it( 'should return a new user object', function ( done ) {
            var data = {
                username: 'rachel34@example.com',
                email: 'rachel34@example.com',
                password: '123',
                "AccountId": 1
            };

            UserService
                .saveNewUser( data )
                .then( function () {
                    return UserService.find( {
                        where: { email: data.email }
                    } );
                } )
                .then( function ( user ) {
                    user.should.be.instanceOf( Array );
                    user[0].should.be.a( 'object' );
                    user[0].should.have.property( 'email', data.email );
                    user[0].should.have.property( 'id' );
                    done();
                } )
                .fail( done );

        } );
    } );

    describe( '.resendAccountConfirmation( me, userId )', function () {
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