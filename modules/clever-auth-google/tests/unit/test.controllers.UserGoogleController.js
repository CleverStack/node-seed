// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

var new_user;

describe( 'controllers.UserGoogleController', function () {
    var Service, UserGoogleController, ctrl, gUsers = [];

    before( function ( done ) {
        testEnv( function ( _UserGoogleService_, _UserGoogleController_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _UserGoogleController_;
            Service = _UserGoogleService_;
            ctrl = new Controller( req, res, next );

            var profile_1 = {
                    _json: {
                        id: '121212121212121',
                        email: 'volodymyrs@clevertech.biz',
                        verified_email: true,
                        name: 'Volodymyr Denshchykov',
                        given_name: 'asasasd',
                        family_name: 'Denssdfsdfhchykov',
                        link: 'https://plus.google.com/112064034597570891032',
                        gender: 'male',
                        locale: 'ru'
                    }
                }
              , profile_2 = {
                    _json: {
                        id: '45454454545454',
                        email: 'volodymyr@clevertech.biz',
                        verified_email: true,
                        name: 'Volodymyr Denshchykov',
                        given_name: 'asasasd',
                        family_name: 'Denssdfsdfhchykov',
                        link: 'https://plus.google.com/112064034597570891032',
                        gender: 'male',
                        locale: 'ru'
                    }
                };

            Service
                .findOrCreate( profile_1, 'bhbhgvbljbhscvzkchvblzclvnzbkjxcv' )
                .then( function( gUser ) {

                    expect( gUser ).to.be.an( 'object' ).and.be.ok;
                    expect( gUser ).to.have.property( 'id' ).and.be.ok;

                    gUsers.push( gUser )

                    Service
                        .findOrCreate( profile_2, 'kjajkvl zsdvbakhvckhabskhv' )
                        .then( function( gUser ) {

                            expect( gUser ).to.be.an( 'object' ).and.be.ok;
                            expect( gUser ).to.have.property( 'id' ).and.be.ok;

                            gUsers.push( gUser )

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
                expect( result ).to.have.property( 'url' ).and.contain( 'https://accounts.google.com/o/oauth2/auth?' );

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
                expect( result[0] ).to.have.property( 'googleid' ).and.be.ok;
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
                expect( result ).to.have.property( 'googleid' ).and.be.ok;
                expect( result ).to.not.have.property( 'token' );

                done();
            };

            ctrl.req.params = { id: gUsers[0].id };

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

            ctrl.req.params = { id: gUsers[0].id };

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