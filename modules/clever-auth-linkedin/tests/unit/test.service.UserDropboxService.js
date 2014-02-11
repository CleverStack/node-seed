var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )
  , testEnv = require ( 'utils' ).testEnv()
  , sinon = require( 'sinon' )
  , Q = require ( 'q' );

var UserService = null;

var lnUserId_1, accessedAtDate, lnUser, user_1;

describe( 'service.UserLinkedinService', function () {
    var Service, Model;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _UserLinkedinService_, _ORMUserLinkedinModel_ ) {

            Service = _UserLinkedinService_;
            Model = _ORMUserLinkedinModel_;

            done();
        }, done );
    } );

    describe( '.formatData( profile, accessToken )', function () {

        it( 'should return an object with filtered data', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = { provider: 'linkedin',
                    id: 'sdjsadj23',
                    displayName: 'Volodymyr Denshchykov',
                    name: { familyName: 'Denshchykov', givenName: 'Volodymyr' },
                    emails: [ { value: 'denshikov_vovan_link@mail.ru' } ],
                    _raw: '{"publicProfileUrl": "http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619",\n  "relationToViewer": {"distance": 0}',
                    _json: {
                        apiStandardProfileRequest: {
                            url: 'http://api.linkedin.com/v1/people/j45jKBkW74'
                        },
                        distance: 0,
                        emailAddress: 'denshikov_vovan_link@mail.ru',
                        firstName: 'Volodymyr',
                        formattedName: 'Volodymyr Denshchykov',
                        headline: 'developer (CleverTech)',
                        id: 'sdjsadj23',
                        industry: 'Information Technology and Services',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        numConnections: 0,
                        numConnectionsCapped: false,
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        positions: { _total: 1, values: [Object] },
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619',
                        relationToViewer: { distance: 0 },
                        siteStandardProfileRequest: {
                            url: 'http://www.linkedin.com/profile/view?id=321293109&authType=name&authToken=W58U&trk=api*a3174153*s3248303*'
                        }
                    }
                };

            var data = Service.formatData( profile, accessToken );

            expect( data ).to.be.an( 'object' ).and.be.ok;

            expect( data ).to.have.property( 'token' ).and.equal( accessToken );
            expect( data ).to.have.property( 'email' ).and.equal( profile._json.emailAddress );
            expect( data ).to.have.property( 'firstname' ).and.equal( profile._json.firstName );
            expect( data ).to.have.property( 'lastname' ).and.equal( profile._json.lastName );
            expect( data ).to.have.property( 'linkedinid' ).and.equal( profile._json.id );
            expect( data ).to.have.property( 'picture' ).and.equal( profile._json.pictureUrl );
            expect( data ).to.have.property( 'link' ).and.equal( profile._json.publicProfileUrl );
            expect( data ).to.have.property( 'locale' ).and.equal( profile._json.location.name );

            expect( data ).to.not.have.property( 'relationToViewer' );
            expect( data ).to.not.have.property( 'positions' );
            expect( data ).to.not.have.property( 'provider' );

            done();
        } );

    } );

    describe( '.findOrCreate( profile, accessToken )', function () {

        it( 'should not call ORMUserLinkedinModel.find() if linkedin account do not have email field', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
                    _json: {
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                };

            var spy = sinon.spy( Model, 'find' );

            Service
                .findOrCreate( profile, accessToken )
                .then( function ( result ) {

                    expect( result ).to.not.be.ok;

                    expect( spy.called ).to.be.false;

                    spy.restore();

                    done();
                }, done )
        } );

        it( 'should call ORMUserLinkedinModel.find(), ORMUserLinkedinModel.create() and create lnUser if linkedin account is verify and do not already exist', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
                , profile = {
                    _json: {
                        emailAddress: 'denshikov_vovan_link@mail.ru',
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                };

            var spyFind = sinon.spy( Model, 'find' );
            var spyCreate = sinon.spy( Model, 'create' );

            Service
                .findOrCreate( profile, accessToken )
                .delay( 1000 )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.be.ok;

                    expect( spyFind.called ).to.be.true;
                    expect( spyFind.calledOnce ).to.be.true;

                    expect( spyCreate.called ).to.be.true;
                    expect( spyCreate.calledOnce ).to.be.true;

                    spyFind.restore();
                    spyCreate.restore();

                    Model
                        .find( result.id )
                        .success( function( user ) {

                            expect( user ).to.be.an( 'object' ).and.be.ok;
                            expect( user ).to.have.property( 'id' ).and.equal( result.id );
                            expect( user ).to.have.property( 'token' ).and.equal( accessToken );
                            expect( user ).to.have.property( 'firstname' ).and.equal( profile._json.firstName );
                            expect( user ).to.have.property( 'lastname' ).and.equal( profile._json.lastName );
                            expect( user ).to.have.property( 'email' ).and.equal( profile._json.emailAddress );
                            expect( user ).to.have.property( 'linkedinid' ).and.equal( profile._json.id );
                            expect( user ).to.have.property( 'locale' ).and.equal( profile._json.location.name );
                            expect( user ).to.have.property( 'picture' ).and.equal( profile._json.pictureUrl );
                            expect( user ).to.have.property( 'link' ).and.equal( profile._json.publicProfileUrl );
                            expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                            lnUserId_1 = user.id;
                            accessedAtDate = new Date( user.accessedAt ) + '';
                            lnUser = user;

                            done();
                        })
                        .error( done );
                }, done )
        } );

        it( 'should call ORMUserLinkedinModel.find(), ORMUserLinkedinModel.updateAttributes(), not call ORMUserLinkedinModel.create() and update already existing lnUser', function ( done ) {
            var accessToken = '15151515151515151'
                , profile = {
                    _json: {
                        emailAddress: 'denshikov_vovan_link@mail.ru',
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                };

            var spyFind = sinon.spy( Model, 'find' );
            var spyCreate = sinon.spy( Model, 'create' );

            Service
                .findOrCreate( profile, accessToken )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( lnUserId_1 );
                    expect( result ).to.have.property( 'token' ).and.equal( accessToken );

                    var newAccessedAtDate = new Date( result.accessedAt ) + '';

                    expect( accessedAtDate ).to.not.equal( newAccessedAtDate );

                    expect( spyFind.called ).to.be.true;
                    expect( spyFind.calledOnce ).to.be.true;

                    expect( spyCreate.called ).to.be.false;

                    spyFind.restore();
                    spyCreate.restore();

                    done();
                }, done )
        } );

    } );

    describe( '.authenticate( lnUser, profile )', function () {

        before( function( done ) {
            var accessToken = '151216562162351626'
                , profile = {
                    _json: {
                        emailAddress: 'denshikov_vovan_link_1@mail.ru',
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                };

            try {
                UserService = injector.getInstance( 'UserService' );
            } catch ( err ) {
                console.log( err );
            }

            Service
                .findOrCreate( profile, accessToken )
                .then( function( user ) {

                    expect( user ).to.be.an( 'object' ).and.be.ok;
                    expect( user ).to.have.property( 'id' ).and.be.ok;

                    lnUser = user;

                    done();
                }, done );
        });

        it( 'should return lnUser if UserService is not defined', function ( done ) {
            var profile = {
                    _json: {
                        emailAddress: 'denshikov_vovan_link_1@mail.ru',
                        firstName: 'Volodymyr',
                        id: 'sdjsadj23',
                        lastName: 'Denshchykov',
                        location: { country: { code: "ua"}, name: 'Ukraine' },
                        pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                        publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                    }
                };

            if ( !UserService ) {
                Service
                    .authenticate( lnUser, profile )
                    .then( function ( user ) {

                        expect( !UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.equal( lnUser.id );
                        expect( user ).to.have.property( 'token' ).and.be.ok;
                        expect( user ).to.have.property( 'firstname' ).and.equal( lnUser.firstname );
                        expect( user ).to.have.property( 'lastname' ).and.equal( lnUser.lastname );
                        expect( user ).to.have.property( 'email' ).and.equal( lnUser.email );
                        expect( user ).to.have.property( 'linkedinid' ).and.equal( lnUser.linkedinid );
                        expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                        done();
                    } )
                    .fail( done );
            } else {
                console.log( 'UserService is defined' );
                done();
            }
        } );

        it( 'should create new user and to associate it with qUser if UserService is defined', function ( done ) {
            var profile = {
                _json: {
                    emailAddress: 'denshikov_vovan_link_1@mail.ru',
                    firstName: 'Volodymyr',
                    id: 'sdjsadj23',
                    lastName: 'Denshchykov',
                    location: { country: { code: "ua"}, name: 'Ukraine' },
                    pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                    publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( lnUser, profile )
                    .then( function ( user ) {

                        expect( !!UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.not.equal( lnUser.id );

                        expect( spy.called ).to.be.true;
                        expect( spy.calledOnce ).to.be.true;

                        spy.restore();

                        UserService
                            .findById( user.id )
                            .then( function( _user ) {

                                expect( _user ).to.be.an( 'object' ).and.be.ok;
                                expect( _user ).to.have.property( 'id' ).and.equal( user.id );
                                expect( _user ).to.have.property( 'email' ).and.equal( profile._json.emailAddress );
                                expect( _user ).to.have.property( 'password' ).and.be.ok;
                                expect( _user ).to.have.property( 'firstname' ).and.equal( profile._json.firstName );
                                expect( _user ).to.have.property( 'lastname' ).and.equal( profile._json.lastName );
                                expect( _user ).to.have.property( 'confirmed' ).and.equal( true );
                                expect( _user ).to.have.property( 'active' ).and.equal( true );

                                user_1 = _user;

                                Service
                                    .find( { where: { id: lnUser.id } } )
                                    .then( function( _lnUser ) {

                                        expect( _lnUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _lnUser = _lnUser[0];

                                        expect( _lnUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _lnUser ).to.have.property( 'id' ).and.equal( lnUser.id );
                                        expect( _lnUser ).to.have.property( 'UserId' ).and.equal( user.id );

                                        done();
                                    }, done )
                            }, done );
                    } )
                    .fail( done );
            } else {
                console.log( 'UserService is not defined' );
                done();
            }

        } );

        it( 'should return existing user by lnUser.UserId if UserService is defined', function ( done ) {
            var profile = {
                _json: {
                    emailAddress: 'denshikov_vovan_link_1@mail.ru',
                    firstName: 'Volodymyr',
                    id: 'sdjsadj23',
                    lastName: 'Denshchykov',
                    location: { country: { code: "ua"}, name: 'Ukraine' },
                    pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                    publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( lnUser, profile )
                    .then( function ( user ) {

                        expect( !!UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.equal( user_1.id );

                        expect( spy.called ).to.be.false;

                        spy.restore();

                        done();
                    } )
                    .fail( done );
            } else {
                console.log( 'UserService is not defined' );
                done();
            }

        } );

        it( 'should return error if user with such lnUser.UserId do not exist and if UserService is defined' , function ( done ) {
            var profile = {
                _json: {
                    emailAddress: 'denshikov_vovan_link_1@mail.ru',
                    firstName: 'Volodymyr',
                    id: 'sdjsadj23',
                    lastName: 'Denshchykov',
                    location: { country: { code: "ua"}, name: 'Ukraine' },
                    pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                    publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                lnUser
                    .updateAttributes( { UserId: 1000 } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( 1000 );

                        Service
                            .authenticate( lnUser, profile )
                            .then( function ( user ) {

                                expect( !!UserService ).to.be.true;

                                expect( user ).to.be.an( 'object' ).and.be.ok;
                                expect( user ).to.have.property( 'statuscode' ).and.equal( 403 );
                                expect( user ).to.have.property( 'message' ).and.be.ok;

                                expect( spy.called ).to.be.false;

                                spy.restore();

                                done();
                            } )
                            .fail( done );
                    })
                    .error( done );
            } else {
                console.log( 'UserService is not defined' );
                done();
            }

        } );

        it( 'should return existing user by lnUser.email if user with such email already exist', function ( done ) {
            var profile = {
                _json: {
                    emailAddress: 'denshikov_vovan_link_1@mail.ru',
                    firstName: 'Volodymyr',
                    id: 'sdjsadj23',
                    lastName: 'Denshchykov',
                    location: { country: { code: "ua"}, name: 'Ukraine' },
                    pictureUrl: 'http://m.c.lnkd.licdn.com/mpr/mprx/0_5R4EHm1kXoIbuS7QI0IzHDhF6uZnaSOQFV2zHDrnJWubAdd6djHQQSkZHG4eSE0Ek4VNFEmO_o2w',
                    publicProfileUrl: 'http://www.linkedin.com/pub/%D0%B2%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80-%D0%B4%D0%B5%D0%BD%D1%89%D0%B8%D0%BA%D0%BE%D0%B2/8b/725/619'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                lnUser
                    .updateAttributes( { UserId: null } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( null );

                        Service
                            .authenticate( lnUser, profile )
                            .then( function ( user ) {

                                expect( !!UserService ).to.be.true;

                                expect( user ).to.be.an( 'object' ).and.be.ok;
                                expect( user ).to.have.property( 'id' ).and.equal( user_1.id );

                                expect( spy.called ).to.be.false;

                                spy.restore();

                                Service
                                    .find( { where: { id: lnUser.id } } )
                                    .then( function( _lnUser ) {

                                        expect( _lnUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _lnUser = _lnUser[0];

                                        expect( _lnUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _lnUser ).to.have.property( 'id' ).and.equal( lnUser.id );
                                        expect( _lnUser ).to.have.property( 'UserId' ).and.equal( user.id );

                                        done();
                                    }, done )
                            } )
                            .fail( done );
                    })
                    .error( done );
            } else {
                console.log( 'UserService is not defined' );
                done();
            }

        } );

    } );

    describe( '.updateAccessedDate( user )', function () {

        it( 'should be able to update user', function ( done ) {

            if ( !!UserService ) {
                user_1
                    .updateAttributes( { accessedAt: null } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'id' ).and.equal( user_1.id );
                        expect( result ).to.have.property( 'accessedAt' ).and.not.be.ok;

                        Service
                            .updateAccessedDate( user_1 )
                            .then( function( result ) {

                                expect( result ).to.be.an( 'object' ).and.be.ok;
                                expect( result ).to.have.property( 'id' ).and.equal( user_1.id );
                                expect( result ).to.have.property( 'accessedAt' ).and.be.ok;

                                done();
                            }, done );
                    })
                    .error( done );

            } else {
                console.log( 'UserService is not defined' );
                done();
            }

        } );

        it( 'should be able to update lnUser', function ( done ) {

            lnUser
                .updateAttributes( { accessedAt: null } )
                .success( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( lnUser.id );
                    expect( result ).to.have.property( 'accessedAt' ).and.not.be.ok;

                    Service
                        .updateAccessedDate( lnUser )
                        .then( function( result ) {

                            expect( result ).to.be.an( 'object' ).and.be.ok;
                            expect( result ).to.have.property( 'id' ).and.equal( lnUser.id );
                            expect( result ).to.have.property( 'accessedAt' ).and.be.ok;

                            done();
                        }, done );
                })
                .error( done );
        } );

        it( 'should be able to get object if it is not a user', function ( done ) {

            Service
                .updateAccessedDate ( { statuscode: 403, message: 'invalid' } )
                .then ( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'statuscode' ).and.equal ( 403 );
                    expect ( result ).to.have.property ( 'message' ).and.be.ok;

                    done ();
                }, done );
        } );

    } );

    describe( '.listUsers()', function () {

        it( 'should be able to get list of all lnUsers', function ( done ) {

            Service
                .listUsers()
                .then( function ( users ) {

                    expect( users ).to.be.an( 'array' ).and.have.length.above( 1 );
                    expect( users[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'linkedinid' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'email' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'picture' ).and.be.ok;
                    expect( users[0] ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.findUserById()', function () {

        it( 'should be able to get lnUser by Id', function ( done ) {

            Service
                .findUserById( lnUser.id )
                .then( function ( lnUser ) {

                    expect( lnUser ).to.be.an( 'object' ).and.be.ok;
                    expect( lnUser ).to.have.property( 'id' ).and.equal( lnUser.id );
                    expect( lnUser ).to.have.property( 'linkedinid' ).and.be.ok;
                    expect( lnUser ).to.have.property( 'email' ).and.be.ok;
                    expect( lnUser ).to.have.property( 'link' ).and.be.ok;
                    expect( lnUser ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should be able to get the error if the lnUser does not exist', function ( done ) {

            Service
                .findUserById( 151515115151515151 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

    } );

    describe( '.deleteUser( lnUserId )', function () {

        it( 'should be able to get the error if the lnUser does not exist', function ( done ) {

            Service
                .deleteUser( 151515115151515151 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to delete lnUser', function ( done ) {

            Service
                .deleteUser( lnUser.id )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                } )
                .fail( done );
        } );

    } );

} );