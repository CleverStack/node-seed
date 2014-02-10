var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )
  , testEnv = require ( 'utils' ).testEnv()
  , sinon = require( 'sinon' )
  , Q = require ( 'q' );

var UserService = null;

var fbUserId_1, accessedAtDate, fbUser, user_1;

describe( 'service.UserFacebookService', function () {
    var Service, Model;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _UserFacebookService_, _ORMUserFacebookModel_ ) {

            Service = _UserFacebookService_;
            Model = _ORMUserFacebookModel_;

            done();
        }, done );
    } );

    describe( '.formatData( profile, accessToken )', function () {

        it( 'should return an object with filtered data', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = { id: '100001182151515151',
                    username: 'denshikov.vovan',
                    displayName: 'Volodumyr Denshchykov',
                    name:
                        {
                            familyName: 'Denshchykov',
                            givenName: 'Volodumyr',
                            middleName: undefined
                        },
                    gender: 'male',
                    profileUrl: 'https://www.facebook.com/denshikov.vovan',
                    emails: [ { value: 'denshikov_vovan@mail.ru' } ],
                    provider: 'facebook',
                    _raw: '{"id":"100001182409330","name":"\\u0432\\u043b\\u0430\\u0434\\u0438\\u043c\\u0438\\u0440 \\u0434\\u0435\\u043d\\u0449\\u0438\\u043a\\u043e\\u0432","first_name":"\\u0432\\u043b\\u0430\\u0434\\u0438\\u043c\\u0438\\u0440","last_name":"\\u0434\\u0435\\u043d\\u0449\\u0438\\u043a\\u043e\\u0432","link":"https:\\/\\/www.facebook.com\\/denshikov.vovan","gender":"male","email":"denshikov_vovan\\u0040mail.ru","timezone":2,"locale":"ru_RU","verified":true,"updated_time":"2014-02-10T16:21:17+0000","username":"denshikov.vovan"}',
                    _json:
                        {
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
                            username: 'denshikov.vovan'
                        }
                }


            var data = Service.formatData( profile, accessToken );

            expect( data ).to.be.an( 'object' ).and.be.ok;

            expect( data ).to.have.property( 'email' ).and.equal( profile._json.email );
            expect( data ).to.have.property( 'firstname' ).and.equal( profile._json.first_name );
            expect( data ).to.have.property( 'lastname' ).and.equal( profile._json.last_name );
            expect( data ).to.have.property( 'facebookid' ).and.equal( profile._json.id );
            expect( data ).to.have.property( 'picture' ).and.be.null;
            expect( data ).to.have.property( 'link' ).and.equal( profile._json.link );
            expect( data ).to.have.property( 'locale' ).and.equal( profile._json.locale );
            expect( data ).to.have.property( 'token' ).and.equal( accessToken );
            
            expect( data ).to.not.have.property( 'gender' );
            expect( data ).to.not.have.property( 'name' );
            expect( data ).to.not.have.property( 'plan' );

            done();
        } );

        it( 'should return an object with filtered data that contain field picture', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
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
                        picture: {
                            data: {
                                url: 'url_for_picture'
                            }
                        }
                    }
                };


            var data = Service.formatData( profile, accessToken );

            expect( data ).to.be.an( 'object' ).and.be.ok;

            expect( data ).to.have.property( 'email' ).and.equal( profile._json.email );
            expect( data ).to.have.property( 'facebookid' ).and.equal( profile._json.id );
            expect( data ).to.have.property( 'picture' ).and.equal( profile._json.picture.data.url );

            done();
        } );

        it( 'should return an object with filtered data that contain field picture', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
                , profile = {
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
                };


            var data = Service.formatData( profile, accessToken );

            expect( data ).to.be.an( 'object' ).and.be.ok;

            expect( data ).to.have.property( 'email' ).and.equal( profile._json.email );
            expect( data ).to.have.property( 'facebookid' ).and.equal( profile._json.id );
            expect( data ).to.have.property( 'picture' ).and.equal( profile._json.picture );

            done();
        } );

    } );

    describe( '.findOrCreate( profile, accessToken )', function () {

        it( 'should not call ORMUserFacebookModel.find() if email is not define', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
                , profile = {
                    _json: {
                        id: '100001182151515151',
                        name: 'Volodumyr Denshchykov',
                        first_name: 'Volodumyr',
                        last_name: 'Denshchykov',
                        link: 'https://www.facebook.com/denshikov.vovan',
                        gender: 'male',
                        email: null,
                        timezone: 2,
                        locale: 'ru_RU',
                        verified: true,
                        updated_time: '2014-02-10T16:21:17+0000',
                        username: 'denshikov.vovan',
                        picture: 'url_for_picture'
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

        it( 'should call ORMUserFacebookModel.find(), ORMUserFacebookModel.create() and create fbUser if facebook account do not already exist', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
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
                            expect( user ).to.have.property( 'firstname' ).and.equal( profile._json.first_name );
                            expect( user ).to.have.property( 'lastname' ).and.equal( profile._json.last_name );
                            expect( user ).to.have.property( 'email' ).and.equal( profile._json.email );
                            expect( user ).to.have.property( 'facebookid' ).and.equal( profile._json.id );
                            expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                            fbUserId_1 = user.id;
                            accessedAtDate = +new Date( user.accessedAt );
                            fbUser = user;

                            done();
                        })
                        .error( done );
                }, done )
        } );

        it( 'should call ORMUserFacebookModel.find(), ORMUserFacebookModel.updateAttributes(), not call ORMUserFacebookModel.create() and update already existing fbUser', function ( done ) {
            var accessToken = '15151515151515151'
              , profile = {
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
                };

            var spyFind = sinon.spy( Model, 'find' );
            var spyCreate = sinon.spy( Model, 'create' );

            Service
                .findOrCreate( profile, accessToken )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( fbUserId_1 );
                    expect( result ).to.have.property( 'token' ).and.equal( accessToken );

                    var newAccessedAtDate = +new Date( result.accessedAt );

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

    describe( '.authenticate( fbUser, profile )', function () {

        before( function( done ) {
            var accessToken = '516516516+51+651'
              , profile = {
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

                    fbUser = user;

                    done();
                }, done );
        });

        it( 'should return fbUser if UserService is not defined', function ( done ) {
            var profile = {
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

            if ( !UserService ) {
                Service
                    .authenticate( fbUser, profile )
                    .then( function ( user ) {

                        expect( !UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.equal( fbUser.id );
                        expect( user ).to.have.property( 'token' ).and.be.ok;
                        expect( user ).to.have.property( 'firstname' ).and.equal( fbUser.firstname );
                        expect( user ).to.have.property( 'lastname' ).and.equal( fbUser.lastname );
                        expect( user ).to.have.property( 'email' ).and.equal( fbUser.email );
                        expect( user ).to.have.property( 'facebookid' ).and.equal( fbUser.facebookid );
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

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( fbUser, profile )
                    .then( function ( user ) {

                        expect( !!UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.not.equal( fbUser.id );

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
                                expect( _user ).to.have.property( 'firstname' ).and.equal( profile._json.first_name );
                                expect( _user ).to.have.property( 'lastname' ).and.equal( profile._json.last_name );
                                expect( _user ).to.have.property( 'confirmed' ).and.equal( true );
                                expect( _user ).to.have.property( 'active' ).and.equal( true );

                                user_1 = _user;

                                Service
                                    .find( { where: { id: fbUser.id } } )
                                    .then( function( _fbUser ) {

                                        expect( _fbUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _fbUser = _fbUser[0];

                                        expect( _fbUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _fbUser ).to.have.property( 'id' ).and.equal( fbUser.id );
                                        expect( _fbUser ).to.have.property( 'UserId' ).and.equal( user.id );

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

        it( 'should return existing user by fbUser.UserId if UserService is defined', function ( done ) {
            var profile = {
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

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( fbUser, profile )
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

        it( 'should return error if user with such fbUser.UserId do not exist and if UserService is defined' , function ( done ) {
            var profile = {
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

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                fbUser
                    .updateAttributes( { UserId: 1000 } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( 1000 );

                        Service
                            .authenticate( fbUser, profile )
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

        it( 'should return existing user by fbUser.email if user with such email already exist', function ( done ) {
            var profile = {
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

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                fbUser
                    .updateAttributes( { UserId: null } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( null );

                        Service
                            .authenticate( fbUser, profile )
                            .then( function ( user ) {

                                expect( !!UserService ).to.be.true;

                                expect( user ).to.be.an( 'object' ).and.be.ok;
                                expect( user ).to.have.property( 'id' ).and.equal( user_1.id );

                                expect( spy.called ).to.be.false;

                                spy.restore();

                                Service
                                    .find( { where: { id: fbUser.id } } )
                                    .then( function( _fbUser ) {

                                        expect( _fbUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _fbUser = _fbUser[0];

                                        expect( _fbUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _fbUser ).to.have.property( 'id' ).and.equal( fbUser.id );
                                        expect( _fbUser ).to.have.property( 'UserId' ).and.equal( user.id );

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

        it( 'should be able to update fbUser', function ( done ) {

            fbUser
                .updateAttributes( { accessedAt: null } )
                .success( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( fbUser.id );
                    expect( result ).to.have.property( 'accessedAt' ).and.not.be.ok;

                    Service
                        .updateAccessedDate( fbUser )
                        .then( function( result ) {

                            expect( result ).to.be.an( 'object' ).and.be.ok;
                            expect( result ).to.have.property( 'id' ).and.equal( fbUser.id );
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

        it( 'should be able to get list of all fbUsers', function ( done ) {

            Service
                .listUsers()
                .then( function ( users ) {

                    expect( users ).to.be.an( 'array' ).and.have.length.above( 1 );
                    expect( users[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'facebookid' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'email' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'locale' ).and.be.ok;
                    expect( users[0] ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.findUserById()', function () {

        it( 'should be able to get fbUser by Id', function ( done ) {

            Service
                .findUserById( fbUser.id )
                .then( function ( fbUser ) {

                    expect( fbUser ).to.be.an( 'object' ).and.be.ok;
                    expect( fbUser ).to.have.property( 'id' ).and.equal( fbUser.id );
                    expect( fbUser ).to.have.property( 'facebookid' ).and.be.ok;
                    expect( fbUser ).to.have.property( 'email' ).and.be.ok;
                    expect( fbUser ).to.have.property( 'locale' ).and.be.ok;
                    expect( fbUser ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should be able to get the error if the fbUser does not exist', function ( done ) {

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

    describe( '.deleteUser( fbUserId )', function () {

        it( 'should be able to get the error if the fbUser does not exist', function ( done ) {

            Service
                .deleteUser( 151515115151515151 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to delete fbUser', function ( done ) {

            Service
                .deleteUser( fbUser.id )
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