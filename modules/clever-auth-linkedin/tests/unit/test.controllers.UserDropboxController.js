// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , sinon = require( 'sinon' )
  , Service;

describe( 'controllers.UserLinkedinController', function () {
    var Service, UserLinkedinController, ctrl, lnUsers = [];

    before( function ( done ) {
        testEnv( function ( _UserLinkedinService_, _UserLinkedinController_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _UserLinkedinController_;
            Service = _UserLinkedinService_;
            ctrl = new Controller( req, res, next );

            var profile_1 = {
                    _json: {
                        emailAddress: 'denshikov_vovan_link_2@mail.ru',
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                }
              , profile_2 = {
                    _json: {
                        emailAddress: 'denshikov_vovan_link_3@mail.ru',
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                };

            Service
                .findOrCreate( profile_1, 'bhbhgvbljbhscvzkchvblzclvnzbkjxcv' )
                .then( function( lnUser ) {

                    expect( lnUser ).to.be.an( 'object' ).and.be.ok;
                    expect( lnUser ).to.have.property( 'id' ).and.be.ok;

                    lnUsers.push( lnUser )

                    Service
                        .findOrCreate( profile_2, 'kjajkvl zsdvbakhvckhabskhv' )
                        .then( function( lnUser ) {

                            expect( lnUser ).to.be.an( 'object' ).and.be.ok;
                            expect( lnUser ).to.have.property( 'id' ).and.be.ok;

                            lnUsers.push( lnUser )

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
                expect( result ).to.have.property( 'url' ).and.contain( 'https://www.linkedin.com/uas/oauth2/authorization?' );

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
                expect( result[0] ).to.have.property( 'linkedinid' ).and.be.ok;
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
                expect( result ).to.have.property( 'linkedinid' ).and.be.ok;
                expect( result ).to.not.have.property( 'token' );

                done();
            };

            ctrl.req.params = { id: lnUsers[0].id };

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

            ctrl.req.params = { id: lnUsers[0].id };

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