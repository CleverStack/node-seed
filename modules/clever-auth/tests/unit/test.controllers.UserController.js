// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

var new_user;

describe( 'controllers.UserController', function () {
    var Service, UserController, ctrl, users = [];

    before( function ( done ) {
        testEnv( function ( _UserService_, _UserController_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            UserController = _UserController_;
            Service = _UserService_;
            ctrl = new UserController( req, res, next );

            Service.create( {
                firstName: 'Joeqwer',
                username: 'joe@example.com',
                email: 'joe@example.com',
                password: '7110eda4d09e062aa5e4a390b0a572ac0d2c0220'
            } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;

                    users.push( user );

                    return Service.create( {
                        firstName: 'Racheller',
                        username: 'rachel@example.com',
                        email: 'rachel@example.com',
                        password: '7110eda4d09e062aa5e4a390b0a572ac0d2c0220'
                    } );
                } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;

                    users.push( user );

                    done();
                } )
                .fail( done );
        } );
    } );

    afterEach( function ( done ) {

        ctrl.req = {
            params: { action: 'fakeAction'},
            method: 'GET',
            query: {},
            body: {}
        };

        ctrl.res = {
            json: function () {}
        };

        done();
    });

    describe( 'static members', function () {

        describe( ' requiresLogin( req, res, next )', function () {

            it( 'should call next if req.isAuthenticated() returns true', function ( done ) {
                var req = {
                        isAuthenticated: function () { return true; }
                    }
                  , res = {}
                  , next = sinon.spy();

                UserController.requiresLogin( req, res, next );

                expect( req.isAuthenticated() ).to.be.true;

                expect( next.called ).to.be.true;

                done();
            } );

            it( 'should send 401 if req.isAuthenticated() returns false', function ( done ) {
                var req = {
                        isAuthenticated: function () { return false; }
                    }
                  , res = {
                        send: sinon.spy()
                    }
                  , next = function () {};

                UserController.requiresLogin( req, res, next );

                expect( req.isAuthenticated() ).to.be.false;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 401 ) ).to.be.true;

                done();
            } );

        } );

        describe( ' requiresAdminRights( req, res, next )', function () {

            it( 'should call next if req.isAuthenticated() returns true and hasAdminRight is true', function ( done ) {
                var req = {
                        isAuthenticated: function () { return true; },
                        session: {
                            passport: {
                                user: {
                                    hasAdminRight: true
                                }
                            }
                        }
                    }
                    , res = {}
                    , next = sinon.spy();

                UserController.requiresAdminRights( req, res, next );

                expect( req.isAuthenticated() ).to.be.true;
                expect( req.session.passport.user.hasAdminRight ).to.be.true;

                expect( next.called ).to.be.true;

                done();
            } );

            it( 'should send 403 if req.isAuthenticated() returns false and hasAdminRight is true', function ( done ) {
                var req = {
                        isAuthenticated: function () { return false; },
                        session: {
                            passport: {
                                user: {
                                    hasAdminRight: true
                                }
                            }
                        }
                    }
                  , res = {
                        send: sinon.spy()
                    }
                  , next = function () {};

                UserController.requiresAdminRights( req, res, next );

                expect( req.isAuthenticated() ).to.be.false;
                expect( req.session.passport.user.hasAdminRight ).to.be.true;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 403 ) ).to.be.true;

                done();
            } );

            it( 'should send 403 if req.isAuthenticated() returns true and hasAdminRight is false', function ( done ) {
                var req = {
                        isAuthenticated: function () { return true; },
                        session: {
                            passport: {
                                user: {
                                    hasAdminRight: false
                                }
                            }
                        }
                    }
                    , res = {
                        send: sinon.spy()
                    }
                    , next = function () {};

                UserController.requiresAdminRights( req, res, next );

                expect( req.isAuthenticated() ).to.be.true;
                expect( req.session.passport.user.hasAdminRight ).to.be.false;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 403 ) ).to.be.true;

                done();
            } );

            it( 'should send 403 if req.isAuthenticated() returns false and hasAdminRight is false', function ( done ) {
                var req = {
                        isAuthenticated: function () { return false; },
                        session: {
                            passport: {
                                user: {
                                    hasAdminRight: false
                                }
                            }
                        }
                    }
                    , res = {
                        send: sinon.spy()
                    }
                    , next = function () {};

                UserController.requiresAdminRights( req, res, next );

                expect( req.isAuthenticated() ).to.be.false;
                expect( req.session.passport.user.hasAdminRight ).to.be.false;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 403 ) ).to.be.true;

                done();
            } );

        } );

        describe( ' checkPasswordRecoveryData( req, res, next )', function () {

            it( 'should call next if is right', function ( done ) {
                var req = {
                        body: {
                            userId: 1,
                            password: 'asasasasa',
                            token: '15151saAS5A1S51A51S'
                        }
                    }
                    , res = {}
                    , next = sinon.spy();

                UserController.checkPasswordRecoveryData( req, res, next );

                expect( req.body.userId ).to.be.ok;
                expect( req.body.password ).to.be.ok;
                expect( req.body.token ).to.be.ok;

                expect( next.called ).to.be.true;

                done();
            } );

            it( 'should send 400 if insufficiently UserId', function ( done ) {
                var req = {
                        body: {
                            password: 'asasasasa',
                            token: '15151saAS5A1S51A51S'
                        }
                    }
                  , res = {
                        send: sinon.spy()
                    }
                  , next = function () {};

                UserController.checkPasswordRecoveryData( req, res, next );

                expect( req.body.userId ).to.not.be.ok;
                expect( req.body.password ).to.be.ok;
                expect( req.body.token ).to.be.ok;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 400, 'Invalid user Id.' ) ).to.be.true;

                done();
            } );

            it( 'should send 400 if insufficiently password', function ( done ) {
                var req = {
                        body: {
                            userId: 1,
                            token: '15151saAS5A1S51A51S'
                        }
                    }
                  , res = {
                        send: sinon.spy()
                    }
                  , next = function () {};

                UserController.checkPasswordRecoveryData( req, res, next );

                expect( req.body.userId ).to.be.ok;
                expect( req.body.password ).to.not.be.ok;
                expect( req.body.token ).to.be.ok;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 400, 'Password does not much the requirements' ) ).to.be.true;

                done();
            } );

            it( 'should send 400 if insufficiently token', function ( done ) {
                var req = {
                        body: {
                            userId: 1,
                            password: '151515'
                        }
                    }
                    , res = {
                        send: sinon.spy()
                    }
                    , next = function () {};

                UserController.checkPasswordRecoveryData( req, res, next );

                expect( req.body.userId ).to.be.ok;
                expect( req.body.password ).to.be.ok;
                expect( req.body.token ).to.not.be.ok;

                expect( res.send.called ).to.be.true;
                expect( res.send.calledWith( 400, 'Invalid Token.' ) ).to.be.true;

                done();
            } );

        } );

    } );

    describe( 'postAction()', function () {

        it( 'should hash password and save user', function ( done ) {
            var data = {
                username: 'admin',
                email: 'admin@example.com',
                password: 'secret_password'
            };

            ctrl.send = function ( user, status ) {

                expect( status ).to.equal( 200 );

                expect( user ).to.be.an( 'object' ).and.be.ok;
                expect( user ).to.have.property( 'id' ).and.be.ok;

                Service.find( { where: { email: 'admin@example.com' } } )
                    .then( function ( users ) {

                        expect( users ).to.be.an( 'array' ).and.have.length( 1 );

                        user = users[0];

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.be.ok;
                        expect( user ).to.have.property( 'username' ).and.equal( data.username );
                        expect( user ).to.have.property( 'email' ).and.equal( data.email );
                        expect( user ).to.have.property( 'password' ).and.equal( '2394a9661a9089208c1c9c65ccac85a91da6a859' );

                        done();
                    } )
                    .fail( done );
            };

            ctrl.req.body = data;

            ctrl.postAction();
        } );

        it( 'should be able to get the error if user with such email already exist', function ( done ) {
            var data = {
                username: 'admin',
                email: users[0].email,
                password: 'secret_password'
            };

            ctrl.send = function ( result, status ) {

                expect ( status ).to.equal ( 400 );

                expect ( result ).to.be.an ( 'string' ).and.be.ok;

                done ();
            };

            ctrl.req.body = data;

            ctrl.postAction ();

        } );

        it( 'should be able to get the error if insufficiently email', function ( done ) {
            var data = {
                username: 'admin',
                password: 'secret_password'
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();

        } );

        //TODO - email confirmation

    } );

    describe( 'putAction()', function () {

        before( function( done ) {

            Service.createUser( {
                firstName: 'cdxsasdf',
                username: 'xcxcxc@example.com',
                email: 'sasasas@example.com',
                password: 'secret_password'
            }, {} )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;

                    new_user = user;

                    done();
                })
                .fail( done );
        });

        it( 'should call UserService.handleUpdateUser( userId, data ) if the data is complete', function ( done ) {
            var data = {
                firstname: 'petrushka'
            };

            var spy = sinon.spy( Service, 'handleUpdateUser' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( result ).to.have.property( 'firstname' ).and.equal( data.firstname );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' );

                expect( spyCall[0] ).to.be.an( 'number' ).and.equal( new_user.id );

                expect( spyCall[1] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[1] ).to.have.property( 'firstname' ).and.equal( data.firstname );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should not call UserService.handleUpdateUser if insufficiently userId', function ( done ) {
            var data = {
                firstname: 'petrushka'
            };

            var spy = sinon.spy( Service, 'handleUpdateUser' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.equal( 'Bad Request' );

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: null };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should call UserService.checkEmailAndUpdate( user, data ) if the data is complete', function ( done ) {
            var data = {
                firstname: 'petrush'
            };

            var spy = sinon.spy( Service, 'checkEmailAndUpdate' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( result ).to.have.property( 'firstname' ).and.equal( data.firstname );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spyCall[1] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[1] ).to.have.property( 'firstname' ).and.equal( data.firstname );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should not call UserService.checkEmailAndUpdate if user with such id do not exist', function ( done ) {
            var data = {
                firstname: 'petrushka'
            };

            var spy = sinon.spy( Service, 'checkEmailAndUpdate' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.equal( 'invalid id' );

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id + 10000000 };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should call UserService.checkEmailAndUpdate( user, data ) if old password correct', function ( done ) {
            var data = {
                password: 'secret_password',
                new_password: 'secret_password_new'
            };

            var spy = sinon.spy( Service, 'checkEmailAndUpdate' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spyCall[1] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[1] ).to.have.property( 'password' ).and.equal( data.password );
                expect( spyCall[1] ).to.have.property( 'new_password' ).and.equal( data.new_password );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should not call UserService.checkEmailAndUpdate if old password incorrect', function ( done ) {
            var data = {
                password: 'secret_password',
                new_password: 'secret_password_new'
            };

            var spy = sinon.spy( Service, 'checkEmailAndUpdate' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.equal( 'Invalid password' );

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should call UserService.updateUser( user, data ) if the email does not change', function ( done ) {
            var data = {
                password: 'secret_password_new',
                new_password: 'secret_password'
            };

            var spy = sinon.spy( Service, 'updateUser' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spyCall[1] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[1] ).to.have.property( 'password' ).and.equal( data.password );
                expect( spyCall[1] ).to.have.property( 'new_password' ).and.equal( data.new_password );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should call UserService.updateUser( user, data ) if the email change and valid', function ( done ) {
            var data = {
                email: 'qqq@mail.ru'
            };

            var spy = sinon.spy( Service, 'updateUser' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spyCall[1] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[1] ).to.have.property( 'email' ).and.equal( data.email );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should not call UserService.updateUser if the email change and already exist', function ( done ) {
            var data = {
                email: 'admin@example.com'
            };

            var spy = sinon.spy( Service, 'updateUser' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.equal( 'email already exists' );

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should call UserService.getUserFullDataJson( options ) If all previous conditions have been met', function ( done ) {
            var data = {
                email: 'qqq_new@mail.ru'
            };

            var spy = sinon.spy( Service, 'getUserFullDataJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' ).and.have.length( 1 );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

        it( 'should be able to get the error if insufficiently userId', function ( done ) {
            var data = {
                username: 'admin',
                password: 'secret_password'
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.equal( 'Bad Request' );

                done();
            };

            ctrl.req.user = { id: users[0].id };
            ctrl.req.params = { id: null };
            ctrl.req.body = data;

            ctrl.putAction();

        } );

        it( 'should be able to get the error if new email already exist', function ( done ) {
            var data = {
                email: users[0].email,
                username: 'admin',
                password: 'secret_password'
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.equal( 'email already exists' );

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.putAction();

        } );

        it( 'should be able to get the error if old password incorrect', function ( done ) {
            var data = {
                password: 'secret_password_incorrect',
                new_password: 'secret_password_new'
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.equal( 'Invalid password' );

                done();
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.putAction();

        } );

        it( 'should hash password and to update firstname, lastname, email, phone, password and do not update other', function ( done ) {
            var data = {
                password: 'secret_password',
                new_password: 'secret_password_updated',

                firstname: 'mishka',
                lastname: 'mikhajlov',
                email: 'qwqwqw@mail.ru',
                phone: '845848485',

                username: 'vasjok',
                confirmed: false,
                active: false
            };

            var old_password = new_user.password;

            ctrl.send = function ( user, status ) {

                expect( status ).to.equal( 200 );

                expect( user ).to.be.an( 'object' ).and.be.ok;
                expect( user ).to.have.property( 'id' ).and.equal( new_user.id );

                Service.findById( new_user.id )
                    .then( function ( newUser ) {

                        expect( newUser ).to.be.an( 'object' ).and.be.ok;
                        expect( newUser ).to.have.property( 'id' ).and.equal( new_user.id );

                        expect( newUser ).to.have.property( 'email' ).and.equal( data.email );
                        expect( newUser ).to.have.property( 'password' ).and.not.equal( old_password );
                        expect( newUser ).to.have.property( 'firstname' ).and.equal( data.firstname );
                        expect( newUser ).to.have.property( 'lastname' ).and.equal( data.lastname );
                        expect( newUser ).to.have.property( 'email' ).and.equal( data.email );
                        expect( newUser ).to.have.property( 'phone' ).and.equal( data.phone );

                        expect( newUser ).to.have.property( 'username' ).and.not.equal( data.username );
                        expect( newUser ).to.have.property( 'confirmed' ).and.not.equal( data.confirmed );
                        expect( newUser ).to.have.property( 'active' ).and.not.equal( data.active );

                        new_user = newUser;

                        done();
                    } )
                    .fail( done );
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.putAction();
        } );

    } );

    describe( 'loginAction()', function () {

        it( 'should call UserService.authenticate() anytime', function ( done ) {

            var spy = sinon.spy( Service, 'authenticate' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args[0];

                expect( spyCall ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall ).to.have.property( 'email' ).and.equal( new_user.email );
                expect( spyCall ).to.have.property( 'password' ).and.equal( '46c8df75e98d0eea89d8414b9bd997b13f33caae' );
                expect( spyCall ).to.have.property( 'confirmed' ).and.equal( true );
                expect( spyCall ).to.have.property( 'active' ).and.equal( true );

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should call this.handleLocalUser( err, user )', function ( done ) {

            var spy = sinon.spy( ctrl, 'handleLocalUser' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall_err = spy.getCall ( 0 ).args[0];
                var spyCall_user = spy.getCall ( 0 ).args[1];

                expect( spyCall_err ).to.be.not.ok;

                expect( spyCall_user ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall_user ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( spyCall_user ).to.have.property( 'email' ).and.equal( new_user.email );
                expect( spyCall_user ).to.not.have.property( 'password' );
                expect( spyCall_user ).to.have.property( 'confirmed' ).and.equal( true );
                expect( spyCall_user ).to.have.property( 'active' ).and.equal( true );

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should call this.loginUserJson( user ) if user was found', function ( done ) {

            var spy = sinon.spy( ctrl, 'loginUserJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args[0];

                expect( spyCall ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( spyCall ).to.have.property( 'email' ).and.equal( new_user.email );
                expect( spyCall ).to.not.have.property( 'password' );
                expect( spyCall ).to.have.property( 'confirmed' ).and.equal( true );
                expect( spyCall ).to.have.property( 'active' ).and.equal( true );

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should not call this.loginUserJson( user ) if user is not found', function ( done ) {

            var spy = sinon.spy( ctrl, 'loginUserJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'object' ).and.be.empty;

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email + '1',
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should call this.req.login( user, cb ) if user was found', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' ).and.have.length( 2 );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( spyCall[0] ).to.have.property( 'email' ).and.equal( new_user.email );
                expect( spyCall[0] ).to.not.have.property( 'password' );
                expect( spyCall[0] ).to.have.property( 'confirmed' ).and.equal( true );
                expect( spyCall[0] ).to.have.property( 'active' ).and.equal( true );

                expect( spyCall[1] ).to.be.an( 'function' ).and.be.ok;

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            var spy = sinon.spy( ctrl.req, 'login' );

            ctrl.loginAction();
        } );

        it( 'should not call this.req.login( user, cb ) if user is not found', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'object' ).and.be.empty;

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email + '1',
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            var spy = sinon.spy( ctrl.req, 'login' );

            ctrl.loginAction();
        } );

        it( 'should call this.handleLoginJson( user, err ) if user was found', function ( done ) {

            var spy = sinon.spy( ctrl, 'handleLoginJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( spyCall[0] ).to.have.property( 'email' ).and.equal( new_user.email );
                expect( spyCall[0] ).to.not.have.property( 'password' );
                expect( spyCall[0] ).to.have.property( 'confirmed' ).and.equal( true );
                expect( spyCall[0] ).to.have.property( 'active' ).and.equal( true );

                expect( spyCall[1] ).to.not.be.ok;

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should not call this.handleLoginJson( user, err ) if user is not found', function ( done ) {

            var spy = sinon.spy( ctrl, 'handleLoginJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'object' ).and.be.empty;

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.body = {
                username: new_user.email + '1',
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should be able to authenticate user', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

        it( 'should be able to get the error and empty object as result if user is not found', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'object' ).and.be.empty;

                done();
            };

            ctrl.req.body = {
                username: new_user.email,
                password: 'secret_password_updated' + '15'
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.loginAction();
        } );

    } );

    describe( 'logoutAction()', function () {

        it( 'should call req.logout() and res.send( {}, 200 )', function ( done ) {
            ctrl.req.logout = sinon.spy();
            ctrl.res.send = sinon.spy();
            ctrl.logoutAction();

            expect( ctrl.req.logout.called ).to.be.true;
            expect( ctrl.req.logout.calledOnce ).to.be.true;

            expect( ctrl.res.send.called ).to.be.true;
            expect( ctrl.res.send.calledOnce ).to.be.true;

            var spyCall = ctrl.res.send.getCall ( 0 ).args;

            expect( spyCall ).to.be.an( 'array' ).and.have.length( 2 )
            expect( spyCall[0] ).to.be.an( 'object' ).and.be.empty;
            expect( spyCall[1] ).to.be.a( 'number' ).and.equal( 200 );

            done();
        } );

    } );

    describe( 'currentAction()', function () {

        it( 'should not call UserService.getUserFullDataJson( options ) if user is not login', function ( done ) {

            var spy = sinon.spy( Service, 'getUserFullDataJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 404 );

                expect( result ).to.be.an( 'object' ).and.be.empty;

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.user = null;

            ctrl.currentAction();
        } );

        it( 'should not call UserService.getUserFullDataJson( options ) if user is login and do not require reload', function ( done ) {

            var spy = sinon.spy( Service, 'getUserFullDataJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.be.ok;

                expect( spy.called ).to.be.false;

                spy.restore();

                done();
            };

            ctrl.req.user = { id: 4 };
            ctrl.req.query = {};

            ctrl.currentAction();
        } );

        it( 'should call UserService.getUserFullDataJson( options ) if user is login and require reload', function ( done ) {
            var spy = sinon.spy( Service, 'getUserFullDataJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args;

                expect( spyCall ).to.be.an( 'array' ).and.have.length( 1 );

                expect( spyCall[0] ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall[0] ).to.have.property( 'id' ).and.equal( new_user.id );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };

            ctrl.req.query = {
                reload: true
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.currentAction();
        } );

        it( 'should call this.loginUserJson( user ) if user is login and require reload', function ( done ) {

            var spy = sinon.spy( ctrl, 'loginUserJson' );

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( new_user.id );

                expect( spy.called ).to.be.true;
                expect( spy.calledOnce ).to.be.true;

                var spyCall = spy.getCall ( 0 ).args[0];

                expect( spyCall ).to.be.an( 'object' ).and.be.ok;
                expect( spyCall ).to.have.property( 'id' ).and.equal( new_user.id );
                expect( spyCall ).to.have.property( 'email' ).and.equal( new_user.email );
                expect( spyCall ).to.not.have.property( 'password' );
                expect( spyCall ).to.have.property( 'confirmed' ).and.equal( true );
                expect( spyCall ).to.have.property( 'active' ).and.equal( true );

                spy.restore();

                done();
            };

            ctrl.req.user = { id: new_user.id };

            ctrl.req.query = {
                reload: true
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.currentAction();
        } );

        it( 'should be able to get user if user is login and require reload', function ( done ) {

            var user = new_user.toJSON();

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( user.id );
                expect( result ).to.have.property( 'username' ).and.equal( user.username );
                expect( result ).to.have.property( 'email' ).and.equal( user.email );
                expect( result ).to.have.property( 'firstname' ).and.equal( user.firstname );
                expect( result ).to.have.property( 'phone' ).and.equal( user.phone );
                expect( result ).to.have.property( 'confirmed' ).and.equal( true );
                expect( result ).to.have.property( 'active' ).and.equal( true );

                done();
            };

            ctrl.req.user = { id: new_user.id };

            ctrl.req.query = {
                reload: true
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.currentAction();
        } );

        it( 'should be able to get user if user is login and not require reload', function ( done ) {

            var user = new_user.toJSON();

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( user.id );
                expect( result ).to.have.property( 'username' ).and.equal( user.username );
                expect( result ).to.have.property( 'email' ).and.equal( user.email );
                expect( result ).to.have.property( 'firstname' ).and.equal( user.firstname );
                expect( result ).to.have.property( 'phone' ).and.equal( user.phone );
                expect( result ).to.have.property( 'confirmed' ).and.equal( true );
                expect( result ).to.have.property( 'active' ).and.equal( true );

                done();
            };

            ctrl.req.user = user;

            ctrl.req.query = {
                reload: false
            };

            ctrl.req.login = function( user, callback ) {
                if ( !!user && !!user.id ) {
                    callback( null, user );
                }
            };

            ctrl.currentAction();
        } );

        it( 'should be able to get the error if user is not login', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect ( status ).to.equal ( 404 );

                expect ( result ).to.be.an ( 'object' ).and.be.empty;

                done ();
            };

            ctrl.req.body = {};

            ctrl.req.user = null;

            ctrl.currentAction();
        } );

    } );

    describe( 'listAction()', function () {

        it( 'should be able to get list of users', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.have.length.above( 1 );
                expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                expect( result[0] ).to.have.property( 'username' ).and.be.ok;
                expect( result[0] ).to.have.property( 'email' ).and.be.ok;
                expect( result[0] ).to.have.property( 'active' ).and.equal( true );
                expect( result[0] ).to.not.have.property( 'password' );

                done();
            };

            ctrl.listAction();
        } );

    } );

    describe( 'getAction()', function () {

        it( 'should be able to get user by id', function ( done ) {

            var user = new_user.toJSON();

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.equal( user.id );
                expect( result ).to.have.property( 'username' ).and.equal( user.username );
                expect( result ).to.have.property( 'email' ).and.equal( user.email );
                expect( result ).to.have.property( 'active' ).and.equal( user.active );
                expect( result ).to.not.have.property( 'password' );

                done();
            };

            ctrl.req.params = { id: new_user.id };

            ctrl.getAction();
        } );

        it( 'should be able to get empty object if user do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and. be.empty;

                done();
            };

            ctrl.req.params = { id: 15151515151151515 };

            ctrl.getAction();
        } );

    } );

} );