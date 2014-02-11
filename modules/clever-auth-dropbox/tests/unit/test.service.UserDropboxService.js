var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , config = require( 'config' )
  , testEnv = require ( 'utils' ).testEnv()
  , sinon = require( 'sinon' )
  , Q = require ( 'q' );

var UserService = null;

var dbUserId_1, accessedAtDate, dbUser, user_1;

describe( 'service.UserDropboxService', function () {
    var Service, Model;

    before( function ( done ) {
        this.timeout( 15000 );
        testEnv( function ( _UserDropboxService_, _ORMUserDropboxModel_ ) {

            Service = _UserDropboxService_;
            Model = _ORMUserDropboxModel_;

            done();
        }, done );
    } );

    describe( '.formatData( profile, accessToken )', function () {

        it( 'should return an object with filtered data', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
                    provider: 'github',
                    id: 1515151515,
                    displayName: 'Volodymyr Denshchykov',
                    emails: [ { value: 'denshikov_vovan@mail.ru' } ],
                    _raw: '{"referral_link": "https://db.tt/FJ8lM2uy", "display_name": "\\u0412\\u043b\\u0430\\u0434\\u0438\\u043c\\u0438\\u0440 \\u0414\\u0435\\u043d\\u0449\\u0438\\u043a\\u043e\\u0432", "uid": 266578368, "country": "UA", "quota_info": {"datastores": 0, "shared": 0, "quota": 2147483648, "normal": 107730}, "email": "denshikov_vovan@mail.ru"}',
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan@mail.ru'
                    }
                };

            var data = Service.formatData( profile, accessToken );

            expect( data ).to.be.an( 'object' ).and.be.ok;

            expect( data ).to.have.property( 'token' ).and.equal( accessToken );
            expect( data ).to.have.property( 'email' ).and.equal( profile._json.email );
            expect( data ).to.have.property( 'firstname' ).and.equal( 'Volodymyr' );
            expect( data ).to.have.property( 'lastname' ).and.equal( 'Denshchykov' );
            expect( data ).to.have.property( 'dropboxid' ).and.equal( profile._json.uid );
            expect( data ).to.have.property( 'link' ).and.equal( profile._json.referral_link );
            expect( data ).to.have.property( 'locale' ).and.equal( profile._json.country );

            expect( data ).to.not.have.property( 'quota_info' );
            expect( data ).to.not.have.property( 'emails' );
            expect( data ).to.not.have.property( 'provider' );

            done();
        } );

    } );

    describe( '.findOrCreate( profile, accessToken )', function () {

        it( 'should not call ORMUserDropboxModel.find() if dropbox account do not have email field', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
              , profile = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 }
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

        it( 'should call ORMUserDropboxModel.find(), ORMUserDropboxModel.create() and create dbUser if dropbox account is verify and do not already exist', function ( done ) {
            var accessToken = 'sdasdasdasdasdasdasdasda'
                , profile = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan@mail.ru'
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
                            expect( user ).to.have.property( 'firstname' ).and.equal( 'Volodymyr' );
                            expect( user ).to.have.property( 'lastname' ).and.equal( 'Denshchykov' );
                            expect( user ).to.have.property( 'email' ).and.equal( profile._json.email );
                            expect( user ).to.have.property( 'dropboxid' ).and.equal( profile._json.uid );
                            expect( user ).to.have.property( 'locale' ).and.equal( profile._json.country );
                            expect( user ).to.have.property( 'link' ).and.equal( profile._json.referral_link );
                            expect( user ).to.have.property( 'accessedAt' ).and.be.ok;

                            dbUserId_1 = user.id;
                            accessedAtDate = new Date( user.accessedAt ) + '';
                            dbUser = user;

                            done();
                        })
                        .error( done );
                }, done )
        } );

        it( 'should call ORMUserDropboxModel.find(), ORMUserDropboxModel.updateAttributes(), not call ORMUserDropboxModel.create() and update already existing dbUser', function ( done ) {
            var accessToken = '15151515151515151'
                , profile = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan@mail.ru'
                    }
                };

            var spyFind = sinon.spy( Model, 'find' );
            var spyCreate = sinon.spy( Model, 'create' );

            Service
                .findOrCreate( profile, accessToken )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( dbUserId_1 );
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

    describe( '.authenticate( dbUser, profile )', function () {

        before( function( done ) {
            var accessToken = '151216562162351626'
                , profile = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan_1@mail.ru'
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

                    dbUser = user;

                    done();
                }, done );
        });

        it( 'should return dbUser if UserService is not defined', function ( done ) {
            var profile = {
                    _json: {
                        referral_link: 'https://db.tt/FJ8lM2uy',
                        display_name: 'Volodymyr Denshchykov',
                        uid: 266578368,
                        country: 'UA',
                        quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                        email: 'denshikov_vovan_1@mail.ru'
                    }
                };

            if ( !UserService ) {
                Service
                    .authenticate( dbUser, profile )
                    .then( function ( user ) {

                        expect( !UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.equal( dbUser.id );
                        expect( user ).to.have.property( 'token' ).and.be.ok;
                        expect( user ).to.have.property( 'firstname' ).and.equal( dbUser.firstname );
                        expect( user ).to.have.property( 'lastname' ).and.equal( dbUser.lastname );
                        expect( user ).to.have.property( 'email' ).and.equal( dbUser.email );
                        expect( user ).to.have.property( 'dropboxid' ).and.equal( dbUser.dropboxid );
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
                    referral_link: 'https://db.tt/FJ8lM2uy',
                    display_name: 'Volodymyr Denshchykov',
                    uid: 266578368,
                    country: 'UA',
                    quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                    email: 'denshikov_vovan_1@mail.ru'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( dbUser, profile )
                    .then( function ( user ) {

                        expect( !!UserService ).to.be.true;

                        expect( user ).to.be.an( 'object' ).and.be.ok;
                        expect( user ).to.have.property( 'id' ).and.not.equal( dbUser.id );

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
                                expect( _user ).to.have.property( 'firstname' ).and.equal( 'Volodymyr' );
                                expect( _user ).to.have.property( 'lastname' ).and.equal( 'Denshchykov' );
                                expect( _user ).to.have.property( 'confirmed' ).and.equal( true );
                                expect( _user ).to.have.property( 'active' ).and.equal( true );

                                user_1 = _user;

                                Service
                                    .find( { where: { id: dbUser.id } } )
                                    .then( function( _dbUser ) {

                                        expect( _dbUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _dbUser = _dbUser[0];

                                        expect( _dbUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _dbUser ).to.have.property( 'id' ).and.equal( dbUser.id );
                                        expect( _dbUser ).to.have.property( 'UserId' ).and.equal( user.id );

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

        it( 'should return existing user by dbUser.UserId if UserService is defined', function ( done ) {
            var profile = {
                _json: {
                    referral_link: 'https://db.tt/FJ8lM2uy',
                    display_name: 'Volodymyr Denshchykov',
                    uid: 266578368,
                    country: 'UA',
                    quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                    email: 'denshikov_vovan_1@mail.ru'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                Service
                    .authenticate( dbUser, profile )
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

        it( 'should return error if user with such dbUser.UserId do not exist and if UserService is defined' , function ( done ) {
            var profile = {
                _json: {
                    referral_link: 'https://db.tt/FJ8lM2uy',
                    display_name: 'Volodymyr Denshchykov',
                    uid: 266578368,
                    country: 'UA',
                    quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                    email: 'denshikov_vovan_1@mail.ru'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                dbUser
                    .updateAttributes( { UserId: 1000 } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( 1000 );

                        Service
                            .authenticate( dbUser, profile )
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

        it( 'should return existing user by dbUser.email if user with such email already exist', function ( done ) {
            var profile = {
                _json: {
                    referral_link: 'https://db.tt/FJ8lM2uy',
                    display_name: 'Volodymyr Denshchykov',
                    uid: 266578368,
                    country: 'UA',
                    quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 107730 },
                    email: 'denshikov_vovan_1@mail.ru'
                }
            };

            if ( !!UserService ) {

                var spy = sinon.spy( UserService, 'create' );

                dbUser
                    .updateAttributes( { UserId: null } )
                    .success( function( result ) {

                        expect( result ).to.be.an( 'object' ).and.be.ok;
                        expect( result ).to.have.property( 'UserId' ).and.equal( null );

                        Service
                            .authenticate( dbUser, profile )
                            .then( function ( user ) {

                                expect( !!UserService ).to.be.true;

                                expect( user ).to.be.an( 'object' ).and.be.ok;
                                expect( user ).to.have.property( 'id' ).and.equal( user_1.id );

                                expect( spy.called ).to.be.false;

                                spy.restore();

                                Service
                                    .find( { where: { id: dbUser.id } } )
                                    .then( function( _dbUser ) {

                                        expect( _dbUser ).to.be.an( 'array' ).and.have.length( 1 );

                                        _dbUser = _dbUser[0];

                                        expect( _dbUser ).to.be.an( 'object' ).and.be.ok;
                                        expect( _dbUser ).to.have.property( 'id' ).and.equal( dbUser.id );
                                        expect( _dbUser ).to.have.property( 'UserId' ).and.equal( user.id );

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

        it( 'should be able to update dbUser', function ( done ) {

            dbUser
                .updateAttributes( { accessedAt: null } )
                .success( function( result ) {

                    expect( result ).to.be.an( 'object' ).and.be.ok;
                    expect( result ).to.have.property( 'id' ).and.equal( dbUser.id );
                    expect( result ).to.have.property( 'accessedAt' ).and.not.be.ok;

                    Service
                        .updateAccessedDate( dbUser )
                        .then( function( result ) {

                            expect( result ).to.be.an( 'object' ).and.be.ok;
                            expect( result ).to.have.property( 'id' ).and.equal( dbUser.id );
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

        it( 'should be able to get list of all dbUsers', function ( done ) {

            Service
                .listUsers()
                .then( function ( users ) {

                    expect( users ).to.be.an( 'array' ).and.have.length.above( 1 );
                    expect( users[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'dropboxid' ).and.be.ok;
                    expect( users[0] ).to.have.property( 'email' ).and.be.ok;
                    expect( users[0] ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

    } );

    describe( '.findUserById()', function () {

        it( 'should be able to get dbUser by Id', function ( done ) {

            Service
                .findUserById( dbUser.id )
                .then( function ( dbUser ) {

                    expect( dbUser ).to.be.an( 'object' ).and.be.ok;
                    expect( dbUser ).to.have.property( 'id' ).and.equal( dbUser.id );
                    expect( dbUser ).to.have.property( 'dropboxid' ).and.be.ok;
                    expect( dbUser ).to.have.property( 'email' ).and.be.ok;
                    expect( dbUser ).to.have.property( 'link' ).and.be.ok;
                    expect( dbUser ).to.not.have.property( 'token' );

                    done();
                } )
                .fail( done );
        } );

        it( 'should be able to get the error if the dbUser does not exist', function ( done ) {

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

    describe( '.deleteUser( dbUserId )', function () {

        it( 'should be able to get the error if the dbUser does not exist', function ( done ) {

            Service
                .deleteUser( 151515115151515151 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to delete dbUser', function ( done ) {

            Service
                .deleteUser( dbUser.id )
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