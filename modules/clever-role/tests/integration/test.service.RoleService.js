var expect = require( 'chai' ).expect
  , Q = require( 'q' )
  , testEnv = require( './utils' ).testEnv
  , roleId_0, roleId_1, roleId_2
  , permIds = [], roleIds = [], sysRoles = [], testUser;

describe( 'service.RoleService', function () {
    var Service, Model, PermissionModel, UserModel;

    before( function( done ) {
        this.timeout( 15000 );
        testEnv( function ( _RoleService_, _RoleModel_, _PermissionModel_, _UserModel_ ) {
            Service = _RoleService_;
            Model = _RoleModel_;
            PermissionModel = _PermissionModel_;
            UserModel = _UserModel_;

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
                promise.push( PermissionModel.create( perm ) );
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
        var systemRoles = [
                {
                    name: 'Super Admin',
                    AccountId: 1
                },
                {
                    name: 'General User',
                    AccountId: 1
                }
            ]
            , testuser = {
                username: 'Vasilij',
                email: 'vasil_clever@gmail.com',
                password: 'qqq',
                RoleId: roleId_2,
                AccountId: 15
            }
            , promise = [];

        systemRoles.forEach( function ( role ) {
            promise.push( Model.find( { where: role } ) );
        } );

        Q.all( promise ).then( function ( result ) {
            promise = [];
            result.forEach( function ( role, index ) {
                if ( !!role && !!role.id ) {
                    sysRoles.push( role );
                } else {
                    promise.push( Model.create( systemRoles[index] ) )
                }
            } );

            Q.all( promise ).then( function ( result ) {
                result.forEach( function ( role, index ) {
                    sysRoles.push( role );
                } );

                UserModel
                    .find( { where: { username: testuser.username } } )
                    .success( function ( user ) {
                        if ( !!user && !!user.id ) {

                            user.updateAttributes( { RoleId: roleId_2 } )
                                .success( function ( user ) {

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.RoleId ).to.equal( roleId_2 );

                                    testUser = user;
                                    done();
                                } )
                                .error( done );
                        } else {
                            UserModel.create( testuser )
                                .success( function ( user ) {

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.RoleId ).to.equal( roleId_2 );

                                    testUser = user;
                                    done();
                                } )
                                .error( done );
                        }
                    } )
                    .error( done );
            }, done );
        }, done );
    } );

    after( function( done ) {
        Model
            .destroy( roleId_0 )
            .success(function(){})
            .error( done );

        var sql_1 = 'delete from PermissionsRoles where RoleId = ' + roleId_0 + ' ;';
        var sql_2 = 'delete from PermissionsRoles where RoleId = ' + roleId_2 + ' ;';

        Q.all( [ Service.query( sql_1 ), Service.query( sql_2 ) ] );

        var promise = [];
        permIds.forEach( function ( permId ) {
            promise.push( PermissionModel.destroy( permId ) );
        } );

        Q.all( promise )
            .then( function() {
                done();
            })
            .fail( done );

    });

    describe( '.saveNewRole( data, accId )', function () {
        it( 'should be able to create a new role', function ( done ) {
            var role = {
                    name: 'Test_Role',
                    description: 'This is the test role'
                }
                , accountId = 1;

            Service.saveNewRole( role, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );

                    roleId_0 = result.id;

                    Model.find( roleId_0 )
                        .success( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'id' );
                            expect( result ).to.have.property( 'name' ).and.equal( role.name );
                            expect( result ).to.have.property( 'description' ).and.equal( role.description );
                            expect( result ).to.have.property( 'AccountId' ).and.equal( accountId );

                            done();
                        } )
                        .error( done );
                }, done );
        } );
    } );

    describe( '.saveRolePermissions( role, permIds )', function () {
        it( 'should not be able to create RolePermissions if permission array is empty', function ( done ) {

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );

                    Service.saveRolePermissions( role, [] )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( result ).to.have.property( 'name' ).and.equal( 'Test_Role' );
                            expect( result ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                            expect( result ).to.have.property( 'AccountId' ).and.equal( 1 );
                            expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                            expect( result.permissions ).to.be.empty;

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.be.empty;

                                    done();
                                })

                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to create RolePermissions', function ( done ) {

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );

                    Service.saveRolePermissions( role, permIds )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( result ).to.have.property( 'name' ).and.equal( 'Test_Role' );
                            expect( result ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                            expect( result ).to.have.property( 'AccountId' ).and.equal( 1 );
                            expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                            expect( result.permissions ).to.have.length( permIds.length );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.have.length( 2 );
                                    expect( result[0] ).to.be.an( 'object' );
                                    expect( result[0] ).to.have.property( 'id' );
                                    expect( result[0] ).to.have.property( 'action' );
                                    expect( result[0] ).to.have.property( 'description' );
                                    expect( result[0].id === permIds[0] || result[0].id === permIds[1] ).to.be.true;
                                    expect( result[1].id === permIds[0] || result[1].id === permIds[1] ).to.be.true;

                                done();
                            })

                        }, done );
                } )
                .error( done );


        } );
    } );

    describe( '.createRoleWithPermissions( data, accId )', function () {
        it( 'should be able to create a new role with permissions', function ( done ) {
            var data = {
                    name: 'Test_Role_1',
                    description: 'This is the test role #1',
                    permIds: permIds
                }
              , accountId = 1;

            Service.createRoleWithPermissions( data, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' ).and.equal( accountId );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_1 = result.id;

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );
                            expect( role ).to.have.property( 'AccountId' ).and.equal( accountId );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.have.length( 2 );
                                    expect( result[0] ).to.be.an( 'object' );
                                    expect( result[0] ).to.have.property( 'id' );
                                    expect( result[0] ).to.have.property( 'action' );
                                    expect( result[0] ).to.have.property( 'description' );
                                    expect( result[0].id === data.permIds[0] || result[0].id === data.permIds[1] ).to.be.true;
                                    expect( result[1].id === data.permIds[0] || result[1].id === data.permIds[1] ).to.be.true;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

        it( 'should be able to create a new role without permissions', function ( done ) {
            var data = {
                    name: 'Test_Role_2',
                    description: 'This is the test role #2',
                    permIds: []
                }
                , accountId = 15;

            Service.createRoleWithPermissions( data, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' ).and.equal( accountId );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_2 = result.id;

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );
                            expect( role ).to.have.property( 'AccountId' ).and.equal( accountId );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.be.empty;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );
    } );

    describe( '.updateRole( role, data )', function () {
        it( 'should be able to update name at existing role', function ( done ) {
            var data = {
                    name: 'Test_Role_updated'
                };

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                    expect( role ).to.have.property( 'name' ).and.equal( 'Test_Role' );
                    expect( role ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                    expect( role ).to.have.property( 'AccountId' ).and.equal( 1 );

                    Service
                        .updateRole( role, data )
                        .then( function( result ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                            expect( role ).to.have.property( 'AccountId' ).and.equal( 1 );

                            done();
                        }, done);

                } )
                .error( done );
        } );

        it( 'should be able to update name and description at existing role', function ( done ) {
            var data = {
                name: 'Test_Role_updated second time',
                description: 'This is the test role updated'
            };

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                    expect( role ).to.have.property( 'name' ).and.equal( 'Test_Role_updated' );
                    expect( role ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                    expect( role ).to.have.property( 'AccountId' ).and.equal( 1 );

                    Service
                        .updateRole( role, data )
                        .then( function( result ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );
                            expect( role ).to.have.property( 'AccountId' ).and.equal( 1 );

                            done();
                        }, done);

                } )
                .error( done );
        } );
    } );

    describe( '.updateRoleWithPermissions( data, accId )', function () {
        it( 'should be able to update a existing role with permissions', function ( done ) {
            var data = {
                    id: roleId_1,
                    name: 'Test_Role_1_updated',
                    description: 'This is the test role #1 updated',
                    permIds: []
                }
              , accountId = 1;

            Service.updateRoleWithPermissions( data, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( roleId_1 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' ).and.equal( accountId );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.be.empty;

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_1 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );
                            expect( role ).to.have.property( 'AccountId' ).and.equal( accountId );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.be.empty;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

        it( 'should be able to update a existing role with permissions', function ( done ) {
            var data = {
                    id: roleId_2,
                    name: 'Test_Role_2_updated',
                    description: 'This is the test role #2 updated',
                    permIds: permIds
                }
                , accountId = 15;

            Service.updateRoleWithPermissions( data, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( roleId_2 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' ).and.equal( accountId );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_2 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );
                            expect( role ).to.have.property( 'AccountId' ).and.equal( accountId );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.have.length( data.permIds.length );
                                    expect( result[0] ).to.be.an( 'object' );
                                    expect( result[0] ).to.have.property( 'id' );
                                    expect( result[0] ).to.have.property( 'action' );
                                    expect( result[0] ).to.have.property( 'description' );
                                    expect( result[0].id === data.permIds[0] || result[0].id === data.permIds[1] ).to.be.true;
                                    expect( result[1].id === data.permIds[0] || result[1].id === data.permIds[1] ).to.be.true;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

        it( 'should not be able to update roles with permissions if the accountId does not coincide with role.accountId', function ( done ) {
            var data = {
                    id: roleId_2,
                    name: 'Test_Role_2_updated_second_time',
                    description: 'This is the test role #2 updated second time',
                    permIds: permIds
                }
                , accountId = 50;

            Service.updateRoleWithPermissions( data, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' );

                    Model.find( roleId_2 )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_2 );
                            expect( role ).to.have.property( 'name' ).and.not.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.not.equal( data.description );
                            expect( role ).to.have.property( 'AccountId' ).and.not.equal( accountId );

                            done();
                        } )
                        .error( done );
                }, done );
        } );
    } );

    describe( '.listRolesWithPerm( accId, roleId )', function () {
        it( 'should be able to get a role with permission', function ( done ) {
            var roleId = roleId_0
              , accountId = 1;

            Service.listRolesWithPerm( accountId, roleId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length( 1 );
                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.contain.keys( 'id', 'name', 'description', 'permissions' );
                    expect( result[0].id ).to.equal( roleId );
                    expect( result[0].permissions ).to.be.an( 'array' );
                    expect( result[0].permissions ).to.have.length.above( 0 );
                    expect( result[0].permissions[0] ).to.be.an( 'object' );
                    expect( result[0].permissions[0] ).to.contain.keys( 'permId', 'action', 'description' );

                    done();
                }, done );
        } );

        it( 'should be able to get a list of roles with permission for accountId', function ( done ) {
            var accountId = 1;

            Service.listRolesWithPerm( accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length.above( 1 );
                    expect( result[ 0 ] ).to.be.an( 'object' );
                    expect( result[ 0 ] ).to.contain.keys( 'id', 'name', 'description', 'permissions' );
                    expect( result[ result.length - 2 ].permissions ).to.be.an( 'array' );
                    expect( result[ result.length - 2 ].permissions[0] ).to.contain.keys( 'permId', 'action', 'description' );

                    done();
                }, done );
        } );
    } );

    describe( '.assignRole( accId, userIds, removed, role )', function () {
        it( 'should be able to get a statuscode 404 if insufficient data', function ( done ) {
            var accountId = 15
              , userIds = []
              , removed = [];

            Service.assignRole( accountId, userIds, removed )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 404 );
                    expect( result ).to.have.property( 'message' );

                    done();
                }, done );
        } );

        it( 'should be able to assign null role for user', function ( done ) {
            var roleId = roleId_2
              , accountId = 15
              , userIds = []
              , removed = [ testUser.id ];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service.assignRole( accountId, userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.be.null;

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to assign role for user', function ( done ) {
            var roleId = roleId_2
                , accountId = 15
                , userIds = [ testUser.id ]
                , removed = [];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service.assignRole( accountId, userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.equal( roleId_2 );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to assign null role for all user', function ( done ) {
            var roleId = roleId_2
                , accountId = 15
                , userIds = []
                , removed = [];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service.assignRole( accountId, userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.be.null;

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

    } );

    describe( '.removeRole( role )', function () {

        before( function ( done ) {
            var roleId = roleId_2
              , accountId = 15
              , userIds = [ testUser.id ]
              , removed = [];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service.assignRole( accountId, userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.equal( roleId_2 );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should not be able to delete system role', function ( done ) {

            Model.find( sysRoles[0].id )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );
                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                    Service.removeRole( role )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( sysRoles[0].id )
                                .success( function ( role ) {

                                    expect( role ).to.be.an( 'object' );
                                    expect( role ).to.have.property( 'id' ).and.equal( sysRoles[0].id );
                                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to delete role', function ( done ) {

            Model.find( roleId_2 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_2 );
                    expect( role ).to.have.property( 'name' );

                    Service.removeRole( role )
                        .then( function () {

                            Model.find( roleId_2 )
                                .success( function ( role ) {

                                    expect( role ).to.not.be.ok;

                                    UserModel
                                        .find( testUser.id )
                                        .success( function ( user ) {

                                            expect( user ).to.be.an( 'object' );
                                            expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                            expect( user.id ).to.equal( testUser.id );
                                            expect( user.RoleId ).to.not.equal( roleId_2 );

                                            done();
                                        } )
                                        .error( done );
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );
    } );

    describe( '.removeRoleWithPermissions( accId, id )', function () {

        it( 'should not be able to delete system role', function ( done ) {
            var accountId = 1;

            Model.find( sysRoles[0].id )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );
                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                    Service.removeRoleWithPermissions( accountId, role.id )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( sysRoles[0].id )
                                .success( function ( role ) {

                                    expect( role ).to.be.an( 'object' );
                                    expect( role ).to.have.property( 'id' ).and.equal( sysRoles[0].id );
                                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should not be able to delete role with permissions if the accountId does not coincide with role.accountId', function ( done ) {
            var accountId = 10;

            Model.find( roleId_1 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_1 );
                    expect( role ).to.have.property( 'name' );

                    Service.removeRoleWithPermissions( accountId, role.id )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( roleId_1 )
                                .success( function ( role ) {

                                    expect( role ).to.be.an( 'object' );
                                    expect( role ).to.have.property( 'id' ).and.equal( roleId_1 );
                                    expect( role ).to.have.property( 'name' );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to delete role with permissions', function ( done ) {
            var accountId = 1;

            Model.find( roleId_1 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_1 );
                    expect( role ).to.have.property( 'name' );

                    Service.removeRoleWithPermissions( accountId, role.id )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( roleId_1 )
                                .success( function ( role ) {

                                    expect( role ).to.not.be.ok;

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );
    } );

    describe( '.hasRole( req, roles )', function () {
        it( 'should be able to get true if user is authenticated and have the role', function ( done ) {
            var roles = ['Recruiter', 'General User']
              , req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        role: {
                            id: 2000,
                            name: 'General User'
                        }
                    }
                };

            expect( req.isAuthenticated() ).to.be.true;
            expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
            expect( Service.hasRole( req, roles ) ).to.be.true;

            done();

        } );

        it( 'should be able to get false if user is authenticated and do not have the role', function ( done ) {
            var roles = ['Recruiter', 'General User']
              , req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        role: {
                            id: 2000,
                            name: 'Test Role'
                        }
                    }
                };

            expect( req.isAuthenticated() ).to.be.true;
            expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
            expect( Service.hasRole( req, roles ) ).to.be.false;

            done();
        } );

        it( 'should be able to get false if user is not authenticated', function ( done ) {
            var roles = ['Recruiter', 'General User']
              , req = {
                    isAuthenticated: function () { return false },
                    user: {}
                };

            expect( req.isAuthenticated() ).to.be.false;
            expect( req ).to.have.property( 'user' );
            expect( Service.hasRole( req, roles ) ).to.be.false;

            done();
        } );
    } );
} );
