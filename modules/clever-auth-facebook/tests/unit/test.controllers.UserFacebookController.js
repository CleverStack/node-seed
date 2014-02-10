// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

var new_user;

describe( 'controllers.UserFacebookController', function () {
    var Service, UserFacebookController, ctrl, fbUsers = [];

    before( function ( done ) {
        testEnv( function ( _UserFacebookService_, _UserFacebookController_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _UserFacebookController_;
            Service = _UserFacebookService_;
            ctrl = new Controller( req, res, next );

            var profile_1 = {
                    _json: {
                        id: '100001182151515151',
                        name: 'Volodumyr Denshchykov',
                        first_name: 'Volodumyr',
                        last_name: 'Denshchykov',
                        link: 'https://www.facebook.com/denshikov.vovan',
                        gender: 'male',
                        email: 'denshikov_vovan@mail.ru',
                        timezone: 2,
                        locale: 'ru_RU',
                        verified: true,
                        updated_time: '2014-02-10T16:21:17+0000',
                        username: 'denshikov.vovan',
                        picture: 'url_for_picture'
                    }
                }
              , profile_2 = {
                    _json: {
                        id: '100001182151515151',
                        name: 'Volodumyr Denshchykov',
                        first_name: 'Volodumyr',
                        last_name: 'Denshchykov',
                        link: 'https://www.facebook.com/denshikov.vovan',
                        gender: 'male',
                        email: 'denshikov_vovanok@mail.ru',
                        timezone: 2,
                        locale: 'ru_RU',
                        verified: true,
                        updated_time: '2014-02-10T16:21:17+0000',
                        username: 'denshikov.vovan',
                        picture: 'url_for_picture'
                    }
                };

            Service
                .findOrCreate( profile_1, 'bhbhgvbljbhscvzkchvblzclvnzbkjxcv' )
                .then( function( fbUser ) {

                    expect( fbUser ).to.be.an( 'object' ).and.be.ok;
                    expect( fbUser ).to.have.property( 'id' ).and.be.ok;

                    fbUsers.push( fbUser );

                    Service
                        .findOrCreate( profile_2, 'kjajkvl zsdvbakhvckhabskhv' )
                        .then( function( fbUser ) {

                            expect( fbUser ).to.be.an( 'object' ).and.be.ok;
                            expect( fbUser ).to.have.property( 'id' ).and.be.ok;

                            fbUsers.push( fbUser );

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
                expect( result ).to.have.property( 'url' ).and.contain( 'https://www.facebook.com/dialog/oauth?' );

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
                expect( result[0] ).to.have.property( 'facebookid' ).and.be.ok;
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
                expect( result ).to.have.property( 'facebookid' ).and.be.ok;
                expect( result ).to.not.have.property( 'token' );

                done();
            };

            ctrl.req.params = { id: fbUsers[0].id };

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

            ctrl.req.params = { id: fbUsers[0].id };

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