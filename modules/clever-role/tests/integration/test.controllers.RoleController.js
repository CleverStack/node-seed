var expect = require( 'chai' ).expect
  , sinon = require( 'sinon' )
  , testEnv = require( './utils' ).testEnv
  , request = require( 'supertest' )
  , app = require( './../../../index' )
  , async = require( 'async' )
  , Q = require( 'q' );

//TODO - to check when tests in seed may be started

var Service, PermissionModel, permIds = [], HRManagerSession, HRManager, roleId_0, roleId_1;

describe ( 'controllers.PermissionController', function () {
    this.timeout ( 10000 );

    before(function (done) {
        var self = this;

        testEnv(function ( _RoleService_, _PermissionModel_ ) {
            Service = _RoleService_;
            PermissionModel = _PermissionModel_;

            async.parallel( [
                function loginAsHRManager( next ) {
                    request( app )
                        .post( '/user/login' )
                        .set( 'Accept', 'application/json' )
                        .send( { username: 'seed@clevertech.biz', password: 'password' })
                        .expect( 'Content-Type' , /json/ )
                        .expect( 200 )
                        .end( function ( err, res ) {
                            HRManagerSession = res.headers['set-cookie'].pop().split(';')[0];
                            HRManager = res.body;
                            next( err );
                        });
                }
            ],
                done );
        });
    });

    before( function ( done ) {
        this.timeout( 15000 );

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
    } );

    after( function( done ) {
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

    describe('.postAction()', function() {

        it('should allow us to create role with permissions', function ( done ) {
            var req = request( app ).post( '/roles' );
            var data = {
                name: 'Test_Role_0',
                description: 'This is the test role #0',
                permIds: permIds
            };
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( data )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_0 = result.id;
                    done();
                });
        });

        it('should allow us to create role without permissions', function ( done ) {
            var req = request( app ).post( '/roles' );
            var data = {
                name: 'Test_Role_1',
                description: 'This is the test role #1',
                permIds: []
            };
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( data )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_1 = result.id;
                    done();
                });
        });
    });

    describe('.putAction()', function() {

        it('should allow us to update role with permissions', function ( done ) {
            var req = request( app ).post( '/roles/' + roleId_0 );
            var data = {
                id: roleId_0,
                name: 'Test_Role_0 updated',
                description: 'This is the test role #0 updated',
                permIds: permIds
            };
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( data )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( roleId_0 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_0 = result.id;
                    done();
                });
        });

        it('should allow us to update role without permissions', function ( done ) {
            var req = request( app ).post( '/roles/' + roleId_1 );
            var data = {
                id: roleId_1,
                name: 'Test_Role_1 updated',
                description: 'This is the test role #1 updated',
                permIds: permIds
            };
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( data )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( roleId_1 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'AccountId' );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    done();
                });
        });

        it('should not allow us to update role if rolId do not coincide', function ( done ) {
            var req = request( app ).post( '/roles/' + roleId_1 );
            var data = {
                id: roleId_1 + 10,
                name: 'Test_Role_1 updated',
                description: 'This is the test role #1 updated',
                permIds: permIds
            };
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( data )
                .expect( 'Content-Type', /json/ )
                .expect( 403 )
                .end(function (err, res) {

                    expect( err ).to.not.be.ok;

                    done();
                });
        });
    });

    describe('.listAction()', function() {

        it('should allow us to get list of roles', function ( done ) {
            var req = request( app ).get( '/roles' );
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length.above( 0 );
                    expect( result[ 0 ] ).to.be.an( 'object' );
                    expect( result[ 0 ] ).to.contain.keys( 'id', 'name', 'description', 'permissions' );

                    done();
                });
        });
    });

    describe('.getAction()', function() {

        it('should allow us to get list of roles', function ( done ) {
            var req = request( app ).get( '/roles/' + roleId_0 );
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

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
                });
        });
    });


    describe('.deleteAction()', function() {

        it('should allow us to delete role with permissions', function ( done ) {
            var req = request( app ).del( '/roles/' + roleId_0 );
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    expect( err ).to.not.be.ok;
                    done();
                });
        });
    });
});
