var expect = require ( 'chai' ).expect
  , sinon = require ( 'sinon' )
  , testEnv = require ( './utils' ).testEnv;

describe ( 'controllers.UserController', function () {
    var UserService, UserController, ctrl, users = [];

    beforeEach ( function ( done ) {
        testEnv ( function ( _UserService_, _UserController_ ) {
            UserService = _UserService_;
            UserController = _UserController_;
            UserController.prototype.fakeAction = function () {
            };

            var req = {
                params: { action: 'fakeAction' },
                method: 'GET',
                query: {}
            };
            var res = {
                json: function () {
                }
            };
            var next = function () {
            };
            ctrl = new UserController ( req, res, next );
            done ();
        } );
    } );

    afterEach ( function () {
        UserService.constructor.instance = null;
    } );

    describe ( 'static members', function () {
        describe ( '.requiresLogin(req, res, next)', function () {
            it ( 'should call next if req.isAuthenticated() returns true', function () {
                var req = {
                        isAuthenticated: function () {
                            return true;
                        }
                    },
                    res = {},
                    next = sinon.spy ();
                UserController.requiresLogin ( req, res, next );
                expect ( next.called ).to.be.true;
            } );

            it ( 'should send 401 if req.isAuthenticated() returns false', function () {
                var req = {
                        isAuthenticated: function () {
                            return false;
                        }
                    },
                    res = {
                        send: sinon.spy ()
                    },
                    next = function () {
                    };
                UserController.requiresLogin ( req, res, next );
                expect ( res.send.calledWith ( 401 ) ).to.be.true;
            } );
        } );

        describe ( '.requiresRole(roleName) -> function(req, res, next)', function () {
            it ( 'should call next() if req.session.user has specified role', function () {
                var req = {
                        isAuthenticated: function () {
                            return true;
                        },
                        session: {
                            user: {
                                roles: ['Trainer']
                            }
                        }
                    },
                    res = {},
                    next = sinon.spy ();
                UserController.requiresRole ( 'Trainer' ) ( req, res, next );
                expect ( next.called ).to.be.true;
            } );

            it ( 'should call send(401) if user hasnt specified role', function () {
                var req = {
                        isAuthenticated: function () {
                            return true;
                        },
                        session: {
                            user: {
                                roles: ['Client']
                            }
                        }
                    },
                    res = {
                        send: sinon.spy ()
                    },
                    next = function () {
                    };
                UserController.requiresRole ( 'Trainer' ) ( req, res, next );
                expect ( res.send.calledWith ( 401 ) ).to.be.true;
            } );
        } );
    } );

    describe ( '.postAction()', function () {
        it ( 'should hash password and save user', function ( done ) {
            ctrl.send = function ( result ) {
                UserService.findAll ()
                    .then ( function ( users ) {
                        expect( users).to.have.length ( 1 );
                        expect ( users[0] ).to.have.property ( 'password' ).and.equal ( '2394a9661a9089208c1c9c65ccac85a91da6a859' );
                        done ();
                    } )
                    .fail ( done );
            };

            ctrl.req.body = {
                username: 'adminTest',
                email: 'adminTest@example.com',
                password: 'secret_password'
            };
            ctrl.postAction ();
        } );

        it ( 'should call .send() with new user', function ( done ) {
            ctrl.send = function ( result ) {
                expect ( result ).to.have.property ( 'username' ).and.equal ( 'adminTest2' );
                expect ( result ).to.have.property ( 'id' ).and.be.ok;
                expect ( result ).to.have.property ( 'password' ).and.equal ( '2394a9661a9089208c1c9c65ccac85a91da6a859' );
                users.push ( result );
                done ();
            };
            ctrl.req.body = {
                username: 'adminTest2',
                email: 'adminTest2@example.com',
                password: 'secret_password'
            };
            ctrl.postAction ();
        } );
    } );

    describe.skip ( '.putAction()', function () {
        it ( 'should hash password and update user', function ( done ) {
            ctrl.send = function ( result ) {
                console.log(result)
                UserService.findById ( users[0].id )
                    .then ( function ( user ) {
                        expect ( result ).to.have.property ( 'username' ).and.equal ( 'admin' );
                        expect ( result ).to.have.property ( 'email' ).and.equal ( 'admin@example.com' );
                        expect ( result ).to.have.property ( 'password' ).and.equal ( '2394a9661a9089208c1c9c65ccac85a91da6a859' );
                        done ();
                    } )
                    .fail ( done );
            };

            ctrl.req.body = {
                username: 'adminTest',
                email: 'adminTest@example.com',
                password: 'secret_password'
            };
            ctrl.req.params.id = users[0].id;
            ctrl.putAction ();
        } );

        it ( 'should call .send() with updated user data', function ( done ) {
            ctrl.send = function ( result ) {
                expect ( result ).to.have.property ( 'username' ).and.equal ( 'adminTest' );
                expect ( result ).to.have.property ( 'email' ).and.equal ( 'adminTest@example.com' );
                expect ( result ).to.have.property ( 'password' ).and.equal ( '2394a9661a9089208c1c9c65ccac85a91da6a859' );
                expect ( result ).to.have.property ( 'id' ).and.be.ok;
                done ();
            };
            ctrl.req.body = {
                username: 'adminTest',
                email: 'adminTest@example.com',
                password: 'secret_password'
            };
            ctrl.req.params.id = users[0].id;
            ctrl.putAction ();
        } );
    } );

//    describe ( '.loginAction()', function () {
//        it ( 'should call req.login(user) if user with such credentials found', function ( done ) {
//            this.timeout ( 5000 );
//            ctrl.req.login = function ( user ) {
//                expect ( user ).to.have.roperty ( 'id' ).to.equal ( users[0].id );
//                done ();
//            };
//            ctrl.req.body = {
//                username: 'adminTest',
//                password: 'secret_password'
//            };
//            ctrl.loginAction ();
//        } );
//
//        it ( 'should call .send(200) if user if such credentials found', function ( done ) {
//            this.timeout ( 5000 );
//            ctrl.req.login = function () {
//            };
//            ctrl.res.send = function ( code ) {
//                expect ( code ).to.equal ( 200 );
//                done ();
//            };
//            ctrl.req.body = {
//                username: 'adminTest',
//                password: 'secret_password'
//            };
//            ctrl.loginAction ();
//        } );
//
//        it ( 'should call .send(403) if user is not found', function ( done ) {
//            this.timeout ( 5000 );
//            ctrl.res.send = function ( code ) {
//                expect ( code ).to.equal ( 403 );
//                done ();
//            };
//            ctrl.req.body = {
//                username: 'adminTest',
//                password: 'wrong_password'
//            };
//            ctrl.loginAction ();
//        } );
//    } );
//
//    describe ( '.logoutAction()', function () {
//        it ( 'should call req.logout() and .send(200)', function () {
//            ctrl.req.logout = sinon.spy ();
//            ctrl.res.send = sinon.spy ();
//            ctrl.logoutAction ();
//
//            expect ( ctrl.req.logout.called ).to.be.true;
//            expect ( ctrl.res.send.calledWith ( 200 ) ).to.be.true;
//        } );
//    } );
} );
