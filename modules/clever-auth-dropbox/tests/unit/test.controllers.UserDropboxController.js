// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

describe( 'controllers.UserDropboxController', function () {
    var Service, UserDropboxController, ctrl, dbUsers = [];

    before( function ( done ) {
        testEnv( function ( _UserDropboxService_, _UserDropboxController_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _UserDropboxController_;
            Service = _UserDropboxService_;
            ctrl = new Controller( req, res, next );

            var profile_1 = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan_2@mail.ru'
                    }
                }
              , profile_2 = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan_3@mail.ru'
                    }
                };

            Service
                .findOrCreate( profile_1, 'bhbhgvbljbhscvzkchvblzclvnzbkjxcv' )
                .then( function( dbUser ) {

                    expect( dbUser ).to.be.an( 'object' ).and.be.ok;
                    expect( dbUser ).to.have.property( 'id' ).and.be.ok;

                    dbUsers.push( dbUser )

                    Service
                        .findOrCreate( profile_2, 'kjajkvl zsdvbakhvckhabskhv' )
                        .then( function( dbUser ) {

                            expect( dbUser ).to.be.an( 'object' ).and.be.ok;
                            expect( dbUser ).to.have.property( 'id' ).and.be.ok;

                            dbUsers.push( dbUser )

                            done();
                        }, done );
                }, done );
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

    describe( 'loginAction()', function () {

        it( 'should call this.send() with specify parameters', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'url' ).and.contain( 'https://www.dropbox.com/1/oauth2/authorize?' );

                done();
            };

            ctrl.loginAction();
        } );

    } );

    describe( 'listAction()', function () {

        it( 'should be able to get list of users', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.have.length.above( 1 );
                expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                expect( result[0] ).to.have.property( 'firstname' ).and.be.ok;
                expect( result[0] ).to.have.property( 'lastname' ).and.be.ok;
                expect( result[0] ).to.have.property( 'email' ).and.be.ok;
                expect( result[0] ).to.have.property( 'dropboxid' ).and.be.ok;
                expect( result[0] ).to.not.have.property( 'token' );

                done();
            };

            ctrl.listAction();
        } );

    } );

    describe( 'getAction()', function () {

        it( 'should be able to get user by id', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' ).and.be.ok;
                expect( result ).to.have.property( 'id' ).and.be.ok;
                expect( result ).to.have.property( 'firstname' ).and.be.ok;
                expect( result ).to.have.property( 'lastname' ).and.be.ok;
                expect( result ).to.have.property( 'email' ).and.be.ok;
                expect( result ).to.have.property( 'dropboxid' ).and.be.ok;
                expect( result ).to.not.have.property( 'token' );

                done();
            };

            ctrl.req.params = { id: dbUsers[0].id };

            ctrl.getAction();
        } );

        it( 'should be able to get error if user do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 15151515151151515 };

            ctrl.getAction();
        } );

    } );

    describe( 'deleteAction()', function () {

        it( 'should be able to delete user by id', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: dbUsers[0].id };

            ctrl.deleteAction();
        } );

        it( 'should be able to get error if user do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 15151515151151515 };

            ctrl.deleteAction();
        } );

    } );

} );