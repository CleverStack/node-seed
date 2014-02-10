var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )
  , testEnv = require ( 'utils' ).testEnv()
  , sinon = require( 'sinon' )
  , Q = require ( 'q' );

var UserService = null;

var gUserId_1, accessedAtDate, gUser, user_1;

describe( 'service.UserGoogleService', function () {
    var Service, Model;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _UserGoogleService_, _ORMUserGoogleModel_ ) {

            Service = _UserGoogleService_;
            Model = _ORMUserGoogleModel_;

            done();
        }, done );
    } );

    describe( '.formatData( profile, accessToken )', function () {

        it( 'should return an object with filtered data', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
                    provider: 'google',
                    id: '112064034597570891452',
                    displayName: 'Volodymyr Denshchykov',
                    name: { familyName: 'Denshchykov', givenName: 'Volodymyr' },
                    emails: [
                        { value: 'volodymyr@clevertech.biz' }
                    ],
                    _raw: '{\n "id": "112064034597570891032",\n "email": "volodymyr@clevertech.biz",\n "verified_email": true,\n "name": "Volodymyr Denshchykov",\n "given_name": "Volodymyr",\n "family_name": "Denshchykov",\n "link": "https://plus.google.com/112064034597570891032",\n "gender": "male",\n "locale": "ru",\n "hd": "clevertech.biz"\n}\n',
                    _json: {
                        id: '112064034597570891032',
                        email: 'volodymyr@clevertech.biz',
                        verified_email: true,
                        name: 'Volodymyr Denshchykov',
                        given_name: 'Volodymyr',
                        family_name: 'Denshchykov',
                        link: 'https://plus.google.com/112064034597570891032',
                        gender: 'male',
                        locale: 'ru',
                        hd: 'clevertech.biz' }
                };

            var data = Service.formatData( profile, accessToken );

            expect( data ).to.be.an( 'object' ).and.be.ok;

            expect( data ).to.have.property( 'token' ).and.equal( accessToken );
            expect( data ).to.have.property( 'firstname' ).and.equal( profile._json.given_name );
            expect( data ).to.have.property( 'lastname' ).and.equal( profile._json.family_name );
            expect( data ).to.have.property( 'email' ).and.equal( profile._json.email );
            expect( data ).to.have.property( 'googleid' ).and.equal( profile._json.id );
            expect( data ).to.have.property( 'picture' ).and.not.be.ok;
            expect( data ).to.have.property( 'link' ).and.equal( profile._json.link );
            expect( data ).to.have.property( 'gender' ).and.equal( profile._json.gender );
            expect( data ).to.have.property( 'locale' ).and.equal( profile._json.locale );
            expect( data ).to.have.property( 'verified' ).and.equal( profile._json.verified_email );

            expect( data ).to.not.have.property( 'hd' );
            expect( data ).to.not.have.property( '_raw' );
            expect( data ).to.not.have.property( 'provider' );

            done();
        } );

    } );

    describe( '.findOrCreate( profile, accessToken )', function () {

        it( 'should not call ORMUserGoogleModel.find() if google account is not verify', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
                    _json: {
                        id: '112064034597570891032',
                        email: 'volodymyr@clevertech.biz',
                        verified_email: false,
                        name: 'Volodymyr Denshchykov',
                        given_name: 'Volodymyr',
                        family_name: 'Denshchykov',
                        link: 'https://plus.google.com/112064034597570891032',
                        gender: 'male',
                        locale: 'ru',
                        hd: 'clevertech.biz' }
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

        it( 'should call ORMUserGoogleModel.find(), ORMUserGoogleModel.create() and create gUser if google account is verify and do not already exist', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
                , profile = {
                    _json: {
                        id: '112064034597570891032',
                        email: 'volodymyr@clevertech.biz',
                        verified_email: true,
                        name: 'Volodymyr Denshchykov',
                        given_name: 'Volodymyr',
                        family_name: 'Denshchykov',
                        link: 'https://plus.google.com/112064034597570891032',
                        gender: 'male',
                        locale: 'ru',
                        hd: 'clevertech.biz' }
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
                            expect( user ).to.have.property( 'firstname' ).and.equal( profile._json.given_name );
                            expect( user ).to.have.property( 'lastname' ).and.equal( profile._json.family_name );
                            expect( user ).to.have.property( 'email' ).and.equal( profile._json.email );
                            expect( user ).to.have.property( 'googleid' ).and.equal( profile._json.id );
                            expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                            gUserId_1 = user.id;
                            accessedAtDate = new Date( user.accessedAt ) + '';
                            gUser = user;

                            done();
                        })
                        .error( done );
                }, done )
        } );

        it( 'should call ORMUserGoogleModel.find(), ORMUserGoogleModel.updateAttributes(), not call ORMUserGoogleModel.create() and update already existing gUser', function ( done ) {
            var accessToken = '15151515151515151'
                , profile = {
                    _json: {
                        id: '112064034597570891032',
                        email: 'volodymyr@clevertech.biz',
                        verified_email: true,
                        name: 'Volodymyr Denshchykov',
                        given_name: 'Volodymyr',
                        family_name: 'Denshchykov',
                        link: 'https://plus.google.com/112064034597570891032',
                        gender: 'male',
                        locale: 'ru',
                        hd: 'clevertech.biz' }
                };

            var spyFind = sinon.spy( Model, 'find' );
            var spyCreate = sinon.spy( Model, 'create' );

            Service
                .findOrCreate( profile, accessToken )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( gUserId_1 );
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

    describe( '.authenticate( gUser, profile )', function () {

        before( function( done ) {
            var accessToken = '151216562162351626'
                , profile = {
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

                    gUser = user;

                    done();
                }, done );
        });

        it( 'should return gUser if UserService is not defined', function ( done ) {
            var profile = {
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
                };

            if ( !UserService ) {
                Service
                    .authenticate( gUser, profile )
                    .then( function ( user ) {

                        expect( !UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.equal( gUser.id );
                        expect( user ).to.not.have.property( 'token' );
                        expect( user ).to.have.property( 'firstname' ).and.equal( gUser.firstname );
                        expect( user ).to.have.property( 'lastname' ).and.equal( gUser.lastname );
                        expect( user ).to.have.property( 'email' ).and.equal( gUser.email );
                        expect( user ).to.have.property( 'googleid' ).and.equal( gUser.googleid );
                        expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                        done();
                    } )
                    .fail( done );
            } else {
                console.log( 'UserService is not defined' );
                done();
            }
        } );

        it( 'should create new user and to associate it with qUser if UserService is defined', function ( done ) {
            var profile = {
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
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( gUser, profile )
                    .then( function ( user ) {

                        expect( !!UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.not.equal( gUser.id );

                        expect( spy.called ).to.be.true;
                        expect( spy.calledOnce ).to.be.true;

                        spy.restore();

                        UserService
                            .findById( user.id )
                            .then( function( _user ) {

                                expect( _user ).to.be.an( 'object' ).and.be.ok;
                                expect( _user ).to.have.property( 'id' ).and.equal( user.id );
                                expect( _user ).to.have.property( 'email' ).and.equal( profile._json.email );
                                expect( _user ).to.have.property( 'password' ).and.be.ok;
                                expect( _user ).to.have.property( 'firstname' ).and.equal( profile._json.given_name );
                                expect( _user ).to.have.property( 'lastname' ).and.equal( profile._json.family_name );
                                expect( _user ).to.have.property( 'confirmed' ).and.equal( true );
                                expect( _user ).to.have.property( 'active' ).and.equal( true );

                                user_1 = _user;

                                Service
                                    .find( { where: { id: gUser.id } } )
                                    .then( function( _gUser ) {

                                        expect( _gUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _gUser = _gUser[0];

                                        expect( _gUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _gUser ).to.have.property( 'id' ).and.equal( gUser.id );
                                        expect( _gUser ).to.have.property( 'UserId' ).and.equal( user.id );

                                        done();
                                    }, done )
                            }, done );
                    } )
                    .fail( done );
            } else {
                console.log( 'UserService is defined' );
                done();
            }

        } );

        it( 'should return existing user by gUser.UserId if UserService is defined', function ( done ) {
            var profile = {
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
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( gUser, profile )
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
                console.log( 'UserService is defined' );
                done();
            }

        } );

        it( 'should return error if user with such gUser.UserId do not exist and if UserService is defined' , function ( done ) {
            var profile = {
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
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                gUser
                    .updateAttributes( { UserId: 1000 } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( 1000 );

                        Service
                            .authenticate( gUser, profile )
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
                console.log( 'UserService is defined' );
                done();
            }

        } );

        it( 'should return existing user by gUser.email if user with such email already exist', function ( done ) {
            var profile = {
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
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                gUser
                    .updateAttributes( { UserId: null } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( null );

                        Service
                            .authenticate( gUser, profile )
                            .then( function ( user ) {

                                expect( !!UserService ).to.be.true;

                                expect( user ).to.be.an( 'object' ).and.be.ok;
                                expect( user ).to.have.property( 'id' ).and.equal( user_1.id );

                                expect( spy.called ).to.be.false;

                                spy.restore();

                                Service
                                    .find( { where: { id: gUser.id } } )
                                    .then( function( _gUser ) {

                                        expect( _gUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _gUser = _gUser[0];

                                        expect( _gUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _gUser ).to.have.property( 'id' ).and.equal( gUser.id );
                                        expect( _gUser ).to.have.property( 'UserId' ).and.equal( user.id );

                                        done();
                                    }, done )
                            } )
                            .fail( done );
                    })
                    .error( done );
            } else {
                console.log( 'UserService is defined' );
                done();
            }

        } );

    } );

    describe( '.updateAccessedDate( user )', function () {

        it( 'should be able to update user', function ( done ) {

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
        } );

        it( 'should be able to update gUser', function ( done ) {

            gUser
                .updateAttributes( { accessedAt: null } )
                .success( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( gUser.id );
                    expect( result ).to.have.property( 'accessedAt' ).and.not.be.ok;

                    Service
                        .updateAccessedDate( gUser )
                        .then( function( result ) {

                            expect( result ).to.be.an( 'object' ).and.be.ok;
                            expect( result ).to.have.property( 'id' ).and.equal( gUser.id );
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

        it( 'should be able to get list of all gUsers', function ( done ) {

            Service
                .listUsers()
                .then( function ( users ) {

                    expect( users ).to.be.an( 'array' ).and.have.length.above( 1 );
                    expect( users[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'googleid' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'email' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'gender' ).and.be.ok;
                    expect( users[0] ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.findUserById()', function () {

        it( 'should be able to get gUser by Id', function ( done ) {

            Service
                .findUserById( gUser.id )
                .then( function ( gUser ) {

                    expect( gUser ).to.be.an( 'object' ).and.be.ok;
                    expect( gUser ).to.have.property( 'id' ).and.equal( gUser.id );
                    expect( gUser ).to.have.property( 'googleid' ).and.be.ok;
                    expect( gUser ).to.have.property( 'email' ).and.be.ok;
                    expect( gUser ).to.have.property( 'gender' ).and.be.ok;
                    expect( gUser ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should be able to get the error if the gUser does not exist', function ( done ) {

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

    describe( '.deleteUser( gUserId )', function () {

        it( 'should be able to get the error if the gUser does not exist', function ( done ) {

            Service
                .deleteUser( 151515115151515151 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to delete gUser', function ( done ) {

            Service
                .deleteUser( gUser.id )
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