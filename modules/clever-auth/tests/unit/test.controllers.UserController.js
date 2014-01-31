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

            Service.saveNewUser( {
                firstName: 'cdxsasdf',
                username: 'xcxcxc@example.com',
                email: 'sasasas@example.com',
                password: 'secret_password'
            } )
                .then( function ( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;

                    new_user = user;

                    done();
                })
                .fail( done );
        });

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

        it.skip( 'should hash password and to update firstname, lastname, email, phone, password and do not update other', function ( done ) {
            var data = {
                password: 'secret_password',
                new_password: 'secret_password_new',

                firstname: 'mishka',
                lastname: 'mikhajlov',
                email: 'qwqwqw@mail.ru',
                phone: '845848485',

                username: 'vasjok',
                confirmed: true,
                active: false
            };

            var old_password = new_user.password;

            ctrl.send = function ( user, status ) {

                expect( status ).to.equal( 200 );

                expect( user ).to.be.an( 'object' ).and.be.ok;
                expect( user ).to.have.property( 'id' ).and.equal( new_ser.id );

                UserService.findById( new_user.id )
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

                        done();
                    } )
                    .fail( done );
            };

            ctrl.req.user = { id: new_user.id };
            ctrl.req.params = { id: new_user.id };
            ctrl.req.body = data;

            ctrl.putAction();
        } );

    } );

    describe( 'loginAction()', function () {

        it( 'should call req.login(user) if user with such credentials found', function ( done ) {

            before( function( done ) {

                Service
                    .findById( new_user.id )
                    .then( function( user ) {

                        user
                            .updateAttributes( { confirmed: true, active: true } )
                            .success( done )
                            .error( done );

                        done();
                    }, done );
            });

            ctrl.send = function ( user, status ) {

                expect( user ).to.be.an( 'object' ).and.be.ok;
                expect( user ).to.have.property( 'id' ).and.equal( users[0].id );

                done();
            };

            ctrl.req.body = {
                username: new_user.username,
                password: 'secret_password'
            };

            ctrl.loginAction();
        } );

        it( 'should call .send( 200 ) if user if such credentials found', function ( done ) {

            ctrl.req.login = function ( data, done ) {
                done( null );
            };

            ctrl.send = function ( user, code ) {

                expect( user ).to.be.an( 'object' ).and.be.ok;
                expect( user ).to.have.property( 'id' ).and.equal( users[0].id );
                expect( user ).to.have.property( 'username' ).and.equal( users[0].username );

                expect( code ).to.equal( 200 );

                done();
            };

            ctrl.req.body = {
                username: users[0].username,
                password: '1234'
            };

            ctrl.loginAction();
        } );

        it( 'should call .send( 403 ) if user is not found', function ( done ) {
            ctrl.send = function ( data, code ) {

                expect( data ).to.be.an( 'object' ).and.be.empty;

                expect( code ).to.equal( 200 );

                done();
            };

            ctrl.req.body = {
                username: users[0].username,
                password: '12345'
            };

            ctrl.loginAction();
        } );
    } );

    describe( 'logoutAction()', function () {

        it( 'should call req.logout() and .send(200)', function ( done ) {
            ctrl.req.logout = sinon.spy();
            ctrl.res.send = sinon.spy();
            ctrl.logoutAction();

            expect( ctrl.req.logout.called ).to.be.true;
            expect( ctrl.res.send.calledWith( 200 ) ).to.be.true;

            done();
        } );

    } );
} );