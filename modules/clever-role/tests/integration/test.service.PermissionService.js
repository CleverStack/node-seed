var expect = require( 'chai' ).expect
  , Q = require( 'q' )
  , testEnv = require( './utils' ).testEnv;

var roleId
  , permIds = [];

describe( 'service.PermissionService', function () {
    var Service, RoleService, Model;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _PermissionService_, _RoleService_, _PermissionModel_ ) {
            Service = _PermissionService_;
            RoleService = _RoleService_;
            Model = _PermissionModel_

            var permissions = [
                {
                    action: 'test_view',
                    description: 'This is the test permissions for view'
                },
                {
                    action: 'test_save',
                    description: 'This is the test permissions for save'
                }
            ];

            var promise = [];
            permissions.forEach( function ( perm ) {
                promise.push( Model.create( perm ) );
            } );

            Q.all( promise ).then( function ( result ) {
                result.forEach( function ( res ) {
                    permIds.push( res.id );
                } );
                done();
            }, done );
        }, done );
    } );

    before( function ( done ) {

        var data = {
                name: 'Test_Role',
                description: 'This is the test role',
                permIds: permIds
            }
            , accountId = 1;

        RoleService.createRoleWithPermissions( data, accountId )
            .then( function ( result ) {

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' );
                expect( result ).to.have.property( 'name' ).and.equal( data.name );
                expect( result ).to.have.property( 'description' ).and.equal( data.description );
                expect( result ).to.have.property( 'AccountId' ).and.equal( accountId );
                expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                expect( result.permissions ).to.have.length( data.permIds.length );

                roleId = result.id;

                done();
            }, done );

    } );

    after( function( done ) {
        Model
            .destroy( roleId )
            .success(function(){})
            .error( done );

        var sql = 'delete from PermissionsRoles where RoleId = ' + roleId + ' ;';

        Q.all( [ Service.query( sql ) ] );

        var promise = [];
        permIds.forEach( function ( permId ) {
            promise.push( Model.destroy( permId ) );
        } );

        Q.all( promise )
            .then( function() {
                done();
            })
            .fail( done );

    });

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

        it( 'should return true, if user is authenticated and have permissions', function ( done ) {
            var req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        hasAdminRight: false,
                        role: {
                            id: roleId
                        }
                    }
                }
                , permissions = [ 'test_view' ];

            Service.hasPermissions( req, permissions, function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( true );
                expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
                expect( permissions ).to.be.an( 'array' );
                expect( permissions ).to.have.length.above( 0 );

                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( true );

                done();
            } );
        } );

        it( 'should return false, if user is authenticated and do not have all permissions', function ( done ) {
            var req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        hasAdminRight: false,
                        role: {
                            id: roleId
                        }
                    }
                }
                , permissions = [ 'test_view', 'test_destroy' ];

            Service.hasPermissions( req, permissions, function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( true );
                expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
                expect( permissions ).to.be.an( 'array' );
                expect( permissions ).to.have.length.above( 0 );

                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( false );

                done();
            } );
        } );

        it( 'should return true, if user is authenticated and do not have any of permissions', function ( done ) {
            var req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        hasAdminRight: false,
                        role: {
                            id: roleId
                        }
                    }
                }
                , permissions = [ 'test_view', 'test_destroy' ]
                , booleanLogic = 'any';

            Service.hasPermissions( req, permissions, booleanLogic , function ( err, hasPerm ) {
                if ( !!err ) {
                    done( err );
                    return;
                }

                expect( req.isAuthenticated() ).to.equal( true );
                expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
                expect( permissions ).to.be.an( 'array' );
                expect( permissions ).to.have.length.above( 0 );
                expect( booleanLogic ).to.equal( 'any' );

                expect( err ).to.be.null;
                expect( hasPerm ).to.equal( true );

                done();
            } );
        } );

    } );
} );
