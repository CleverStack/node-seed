// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

var new_user;

describe( 'controllers.UserGithubController', function () {
    var Service, UserGithubController, ctrl, gUsers = [];

    before( function ( done ) {
        testEnv( function ( _UserGithubService_, _UserGithubController_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _UserGithubController_;
            Service = _UserGithubService_;
            ctrl = new Controller( req, res, next );

            var profile_1 = {
                    _json: {
                        id: '112064034597570891032',
                        email: 'volodymyrm@clevertech.biz',
                        name: 'Volodymyr Denshchykov',
                        html_url: 'https://github.com/denshikov-vovan',
                        location: 'Ukraine',
                        avatar_url: 'https://gravatar.com/avatar/e98ef168c69fd2a812a8dd46a775072a?d=https%3A%2F%2Fidenticons.github.com%2F814919104a88497c37d2154d918bba97.png&r=x'
                    }
                }
              , profile_2 = {
                    _json: {
                        id: '112064034597570891032',
                        email: 'volodymyrm1@clevertech.biz',
                        name: 'Volodymyr Petrov',
                        html_url: 'https://github.com/denshikov-vovan',
                        location: 'Ukraine',
                        avatar_url: 'https://gravatar.com/avatar/e98ef168c69fd2a812a8dd46a775072a?d=https%3A%2F%2Fidenticons.github.com%2F814919104a88497c37d2154d918bba97.png&r=x'
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
                expect( result ).to.have.property( 'url' ).and.contain( 'https://github.com/login/oauth/authorize?' );

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
                expect( result[0] ).to.have.property( 'githubid' ).and.be.ok;
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
                expect( result ).to.have.property( 'githubid' ).and.be.ok;
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