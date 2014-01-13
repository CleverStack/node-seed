var expect = require( 'chai' ).expect
  , Q = require( 'q' )
  , testEnv = require( './utils' ).testEnv
  , roleId
  , permIds = [];

describe( 'service.RoleService', function () {
    var Service, Model, PermissionModel;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _RoleService_, _RoleModel_, _PermissionModel_ ) {
            Service = _RoleService_;
            Model = _RoleModel_;
            PermissionModel = _PermissionModel_;

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

    describe( '.saveNewRole( data, accId )', function () {
        it( 'should be able to create a new role', function ( done ) {
            var role = {
                    name: 'Test_Role',
                    description: 'This is the test rile'
                }
                , accountId = 1;

            Service.saveNewRole( role, accountId )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );

                    roleId = result.id;

                    Model.find( roleId )
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
        it( 'should be able to create RolePermissions', function ( done ) {

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );

                    Service.saveRolePermissions( role, permIds )
                        .then( function ( result ) {



                            done();
                        }, done );

                    done();
                } )
                .error( done );


        } );
    } );



} );
