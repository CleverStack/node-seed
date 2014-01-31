// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

describe( 'controllers.UserController', function () {
    var Service, UserController, ctrl, users = [];

    beforeEach( function ( done ) {
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

    afterEach( function () {
        Service.constructor.instance = null;
    } );

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
                email: 'admin@example.com',
                password: 'secret_password'
            };

            Service
                .create( data )
                .then( function( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;

                    ctrl.send = function ( result, status ) {

                        expect( status ).to.equal( 400 );

                        expect( result ).to.be.an( 'string' ).and.be.ok;

                        done();
                    };

                    ctrl.req.body = data;

                    ctrl.postAction();

                })
                .fail( done );
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

        it( 'should be able to get the error if insufficiently userId', function ( done ) {
            var data = {
                username: 'admin',
                password: 'secret_password'
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 400 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req = {
                user: { id: users[0].id },
                params: { id: null }
            };

            ctrl.req.body = data;

            ctrl.putAction();

        } );

        it( 'should hash password and update user', function ( done ) {
            var data = {
                username: 'admin',
                email: 'admin@example.com',
                password: 'secret_password'
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                UserService.findById( users[0].id )
                    .then( function ( user ) {

                        user.username.should.equal( 'admin' );
                        user.email.should.equal( 'admin@example.com' );
                        user.password.should.equal( '2394a9661a9089208c1c9c65ccac85a91da6a859' );

                        done();
                    } )
                    .fail( done );
            };

            ctrl.req = {
                body: data,
                user: { id: users[0].id },
                params: { id: users[0].id }
            };

            ctrl.putAction();
        } );


    } );

    describe.skip( 'loginAction()', function () {
        it( 'should call req.login(user) if user with such credentials found', function ( done ) {
            ctrl.req.login = function ( user ) {
                user.id.should.eql( users[0].id );
                done();
            };
            ctrl.req.body = {
                username: users[0].username,
                password: '1234'
            };
            ctrl.loginAction();
        } );

        it( 'should call .send(200) if user if such credentials found', function ( done ) {
            ctrl.req.login = function ( data, done ) {
                done( null );
            };
            ctrl.send = function ( user, code ) {
                user.username.should.equal( users[0].username );
                code.should.equal( 200 );
                done();
            };
            ctrl.req.body = {
                username: users[0].username,
                password: '1234'
            };
            ctrl.loginAction();
        } );

        it( 'should call .send(403) if user is not found', function ( done ) {
            ctrl.send = function ( data, code ) {
                data.should.eql( {} );
                code.should.equal( 403 );
                done();
            };
            ctrl.req.body = {
                username: users[0].username,
                password: '12345'
            };
            ctrl.loginAction();
        } );
    } );

    describe.skip( 'logoutAction()', function () {
        it( 'should call req.logout() and .send(200)', function () {
            ctrl.req.logout = sinon.spy();
            ctrl.res.send = sinon.spy();
            ctrl.logoutAction();

            ctrl.req.logout.called.should.be.true;
            ctrl.res.send.calledWith( 200 ).should.be.true;
        } );
    } );
} );