var expect = require( 'chai' ).expect
  , Q = require( 'q' )
  , testEnv = require( './utils' ).testEnv;

var roleId;

describe( 'service.PermissionService', function () {
    var Service, RoleService;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _PermissionService_, _RoleService_ ) {
            Service = _PermissionService_;
            RoleService = _RoleService_;

            var permissions = {
                    action: 'test_view',
                    description: 'This is the test permissions'
                }
              , data = {
                    name: 'Test_Role',
                    description: 'This is the test rile',
                    permissions: permissions
                }
              , accountId = 1;

            RoleService.createRoleWithPermissions( data, accountId )
                .then( function( result ) {
                    done();
                })
                .fail( done );
        }, done );
    } );

    describe( '.hasPermissions( req, permissions, booleanLogic, fn )', function () {

        it( 'should return false, if user is not authenticated', function ( done ) {
            var req = {
                    isAuthenticated: function () { return false }
                }
              , permissions = [];

            Service.hasPermissions( req, permissions, function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( false );
                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( false );

                done();
            } );
        } );

        it( 'should return false, if user do not have field role', function ( done ) {
            var req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        hasAdminRight: false
                    }
                }
              , permissions = [];

            Service.hasPermissions( req, permissions, function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( true );
                expect( req.user ).to.not.have.property( 'role' );
                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( false );

                done();
            } );
        } );

        it( 'should return true, if user is authenticated and have admin right', function ( done ) {
            var req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        hasAdminRight: true,
                        role: {
                            id: 2000,
                            name: 'Test_Role'
                        }
                    }
                }
                , permissions = [];

            Service.hasPermissions( req, permissions, function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( true );
                expect( req ).to.have.property( 'user' ).and.have.property( 'hasAdminRight' ).and.equal( true );
                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( true );

                done();
            } );
        } );

        it( 'should return true, if user is authenticated and permissions are not necessary', function ( done ) {
            var req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        hasAdminRight: false,
                        role: {
                            id: 2000,
                            name: 'Test_Role'
                        }
                    }
                }
              , permissions = [];

            Service.hasPermissions( req, permissions, function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( true );
                expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
                expect( permissions ).to.be.empty;
                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( true );

                done();
            } );
        } );



    } );


//        it( 'should return User with "account" and "role" properties', function ( done ) {
//            var data = {
//                username: 'Rachel2',
//                email: 'rachel2@example.com',
//                password: '1234'
//            };
//
//            UserService
//                .create( data )
//                .then( function () {
//                    return UserService.authenticate( {
//                        email: data.email,
//                        password: data.password
//                    } );
//                } )
//                .then( function ( user ) {
//                    user.username.should.equal( data.username );
//
//                    user.should.have.property( 'account' );
//                    user.should.have.property( 'role' );
//
//                    done();
//                } )
//                .fail( done );
//        } );
//
//        it( 'should not return user when he is not active', function ( done ) {
//            var data = {
//                username: 'Joe3',
//                email: 'joe3@example.com',
//                password: '1234',
//                active: false
//            };
//
//            UserService
//                .create( data )
//                .then( function () {
//                    return UserService.authenticate( {
//                        email: data.email,
//                        password: data.password
//                    } );
//
//                } )
//                .then( function ( user ) {
//                    should.not.exist( user );
//
//                    done();
//                } )
//                .fail( done );
//        } );
//
//        it( 'should not return user when he is not active', function ( done ) {
//            var data = {
//                username: 'Joe4',
//                email: 'joe4@example.com',
//                password: '1234',
//                active: false
//            };
//
//            UserService
//                .create( data )
//                .then( function () {
//                    return UserService.authenticate( {
//                        email: 'noneExistedEmail@somemail.com',
//                        password: data.password
//                    } );
//
//                } )
//                .then( function ( user ) {
//                    should.not.exist( user );
//
//                    done();
//                } )
//                .fail( done );
//        } );
//
//        it( 'should set "accessedAt" property after successfull login', function ( done ) {
//            var lastLogin = null
//                , data = {
//                    username: 'Joe5',
//                    email: 'joe5@example.com',
//                    password: '1234',
//                    active: true
//                };
//
//            UserService
//                .create( data )
//                .then( function () {
//
//                    return UserService.authenticate( {
//                        email: data.email,
//                        password: data.password
//                    } );
//                } )
//                .then( function ( user ) {
//                    user.should.have.property( 'accessedAt' );
//                    lastLogin = user.accessedAt;
//
//                    return lastLogin;
//
//
//                } )
//                .delay( 1000 )
//                .then( function () {
//                    return UserService.authenticate( {
//                        email: data.email,
//                        password: data.password
//                    } );
//                } )
//                .then( function ( user ) {
//                    user.should.have.property( 'accessedAt' );
//                    user.accessedAt.should.not.equal( lastLogin );
//
//                    done();
//                } )
//                .fail( done );
//        } );
//    } );

} );
