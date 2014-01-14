var expect = require( 'chai' ).expect
  , sinon = require( 'sinon' )
  , testEnv = require( './utils' ).testEnv
  , request = require( 'supertest' )
  , app = require( './../../../index' )
  , async = require( 'async' )
  , Q = require( 'q' );

var Service, Model, permIds = [], HRManagerSession, HRManager;

describe ( 'controllers.PermissionController', function () {
    this.timeout ( 10000 );

    before(function (done) {
        var self = this;

        testEnv(function (_PermissionService_, _PermissionModel_ ) {
            Service = _PermissionService_;
            Model = _PermissionModel_;

            async.parallel( [
//                function loginAsHRManager( next ) {
//                    request( app )
//                        .post( '/user/login' )
//                        .set( 'Accept', 'application/json' )
//                        .send( { username: 'seed@clevertech.biz', password: 'password' })
//                        .expect( 'Content-Type' , /json/ )
//                        .expect( 200 )
//                        .end( function ( err, res ) {
//                            HRManagerSession = res.headers['set-cookie'].pop().split(';')[0];
//                            HRManager = res.body;
//                            next( err );
//                        });
//                }
            ],
                done );
        });
    });

    describe('.listAction()', function() {

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
                promise.push( Model.create( perm ) );
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
                promise.push( Model.destroy( permId ) );
            } );

            Q.all( promise )
                .then( function() {
                    done();
                })
                .fail( done );

        });

        it('should allow us to get list of permissions', function ( done ) {
            var req = request( app ).get( '/permissions' );
            req.cookies = HRManagerSession;
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    result.should.be.instanceof( Array );
                    result.length.should.be.above ( 0 );
                    result[ 0 ].should.be.instanceof( Object );
                    result[ 0 ].should.have.properties( 'id', 'action', 'description' );

                    done();
                });
        });
    });
});
