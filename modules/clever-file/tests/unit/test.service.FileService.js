var expect = require ( 'chai' ).expect
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , testEnv = require ( 'utils' ).testEnv()
  , Q = require ( 'q' );

var userId_1, fileId_1;

describe( 'service.FileService', function () {
    var Service, Model, UserModel, FileModel;

    before( function ( done ) {
        testEnv( function ( _FileService_, _ORMFileModel_, _ORMUserModel_ ) {

            Service = _FileService_;
            Model = _ORMFileModel_;
            UserModel = _ORMUserModel_;

            var user_1 = { username: 'voffka', email: 'voffka@mail.ru', password: '1234', firstname: 'vova', lastname: 'petrov' };

            UserModel
                .create( user_1 )
                .success( function( user ) {

                    expect( user ).to.be.an( 'object' );
                    expect( user ).to.have.property( 'id' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( user_1.username );

                    userId_1 = user.id;

                    done();
                })
                .error( done );
        }, done );
    } );

    describe( '.normalizeData( data )', function () {

        it( 'should return an normalize data if field user is exist', function ( done ) {

            var data = {
                id: 4365,
                name: 'someFile.ico',
                url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og',
                type: 'image/ico',
                size: 151515,
                lastModified: ( new Date() ).toString(),
                UserId: 1,
                AccountId: 1,
                user: {
                    id: 1,
                    firstname: 'petro',
                    lastname: 'saveljev'
                },
                somefield: 'some content'
            };

            var normDate = Service.normalizeData( data );

            expect( normDate ).to.be.an( 'object' );
            expect( normDate ).to.have.property( 'id' ).and.equal( data.id );
            expect( normDate ).to.have.property( 'name' ).and.equal( data.name );
            expect( normDate ).to.have.property( 'type' ).and.equal( data.type );
            expect( normDate ).to.have.property( 'url' ).and.equal( data.url );
            expect( normDate ).to.have.property( 'size' ).and.equal( data.size );
            expect( normDate ).to.have.property( 'lastModified' ).and.equal( data.lastModified );
            expect( normDate ).to.have.property( 'UserId' ).and.equal( data.UserId );
            expect( normDate ).to.have.property( 'AccountId' ).and.equal( data.AccountId );
            expect( normDate ).to.have.property( 'username' ).and.equal( data.user.firstname + ' ' + data.user.lastname );

            expect( normDate ).to.not.have.property( 'somefield' );

            done();
        } );

        it( 'should return an normalize data if field user is not exist', function ( done ) {

            var data = {
                id: 4365,
                name: 'someFile.ico',
                url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og',
                type: 'image/ico',
                size: 151515,
                lastModified: ( new Date() ).toString(),
                UserId: 1,
                AccountId: 1,
                somefield: 'some content'
            };

            var normDate = Service.normalizeData( data );

            expect( normDate ).to.be.an( 'object' );
            expect( normDate ).to.have.property( 'id' ).and.equal( data.id );
            expect( normDate ).to.have.property( 'name' ).and.equal( data.name );
            expect( normDate ).to.have.property( 'type' ).and.equal( data.type );
            expect( normDate ).to.have.property( 'url' ).and.equal( data.url );
            expect( normDate ).to.have.property( 'size' ).and.equal( data.size );
            expect( normDate ).to.have.property( 'lastModified' ).and.equal( data.lastModified );

            expect( normDate ).to.not.have.property( 'UserId' );
            expect( normDate ).to.not.have.property( 'AccountId' );
            expect( normDate ).to.not.have.property( 'username' );

            expect( normDate ).to.not.have.property( 'somefield' );

            done();
        } );

    } );

    describe( '.createFile( userId, accountId, file )', function () {

        it( 'should be able to create file', function ( done ) {

            var data = {
                    name: 'someFile.ico',
                    url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og',
                    type: 'image/ico',
                    size: 151515,
                    lastModified: ( new Date() ).toString()
                }
              , userId = userId_1
              , accountId = 1;

            Service
                .createFile( userId, accountId, data )
                .then( function( file ) {

                    expect( file ).to.be.an( 'object' );
                    expect( file ).to.have.property( 'id' ).and.be.ok;
                    expect( file ).to.have.property( 'name' ).and.equal( data.name );

                    fileId_1 = file.id;

                    Model
                        .find( fileId_1 )
                        .success( function( file ) {

                            expect( file ).to.be.an( 'object' );
                            expect( file ).to.have.property( 'id' ).and.be.ok;
                            expect( file ).to.have.property( 'name' ).and.equal( data.name );
                            expect( file ).to.have.property( 'AccountId' ).and.equal( accountId );
                            expect( file ).to.have.property( 'UserId' ).and.equal( userId );

                            done();
                        })
                        .error( done );
                }, done );
        } );

        it( 'should be able to get the error if the file with such url already exist', function ( done ) {

            var data = {
                    name: 'someFile2.ico',
                    url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og',
                    type: 'image2/ico',
                    size: 151515,
                    lastModified: ( new Date() ).toString()
                }
              , userId = userId_1
              , accountId = 1;

            Service
                .createFile( userId, accountId, data )
                .then( function( file ) {

                    expect( file ).to.be.an( 'object' );
                    expect( file ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( file ).to.have.property( 'message' ).and.be.ok;

                    Model
                        .findAll( { where: { url: data.url } } )
                        .success( function( files ) {

                            expect( files ).to.be.an( 'array' ).and.have.length( 1 );
                            expect( files[0] ).to.be.an( 'object' ).and.be.ok;
                            expect( files[0] ).to.have.property( 'id' ).and.equal( fileId_1 );
                            expect( files[0] ).to.have.property( 'url' ).and.equal( data.url );

                            done();
                        })
                        .error( done );
                })
                .fail( done );
        } );

        it( 'should be able to get the error if insufficient data', function ( done ) {

            var data = {
                    name: 'someFile2.ico',
                    type: 'image2/ico',
                    size: 151515,
                    lastModified: ( new Date() ).toString()
                }
              , userId = userId_1
              , accountId = 1;

            Service
                .createFile( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                })
                .fail( done );
        } );

        it( 'should be able to get the error if insufficient data', function ( done ) {

            var data = {
                    url: 'ZxZZxZXZXZx',
                    name: 'someFile2.ico',
                    type: 'image2/ico',
                    size: 151515,
                    lastModified: ( new Date() ).toString()
                }
              , userId = userId_1
              , accountId = 0;

            Service
                .createFile( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                })
                .fail( done );
        } );

    });

    describe( '.createFiles( userId, accountId, files )', function () {

        it( 'should be able to create files', function ( done ) {

            var data = [
                    {
                        name: 'someFile3.ico',
                        url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og1',
                        type: 'image/ico',
                        size: 151515,
                        lastModified: ( new Date() ).toString()
                    },
                    {
                        name: 'someFile4.ico',
                        url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og2',
                        type: 'image/ico',
                        size: 151515,
                        lastModified: ( new Date() ).toString()
                    }
                ]
              , userId = userId_1
              , accountId = 1;

            Service
                .createFiles( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.have.length( 2 );
                    expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[1] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[1] ).to.have.property( 'id' ).and.be.ok;

                    Model
                        .findAll( { where: { url: data[0].url } } )
                        .success( function( files ) {

                            expect( files ).to.be.an( 'array' ).and.have.length( 1 );
                            expect( files[0] ).to.be.an( 'object' ).and.be.ok;
                            expect( files[0] ).to.have.property( 'id' ).and.be.ok;
                            expect( files[0] ).to.have.property( 'url' ).and.equal( data[0].url );

                            Model
                                .findAll( { where: { url: data[1].url } } )
                                .success( function( files ) {

                                    expect( files ).to.be.an( 'array' ).and.have.length( 1 );
                                    expect( files[0] ).to.be.an( 'object' ).and.be.ok;
                                    expect( files[0] ).to.have.property( 'id' ).and.be.ok;
                                    expect( files[0] ).to.have.property( 'url' ).and.equal( data[1].url );

                                    done();
                                })
                                .error( done );
                        })
                        .error( done );
                }, done );
        } );

        it( 'should be able to get the error if insufficient data', function ( done ) {

            var data = [ {
                    name: 'someFile2.ico',
                    url: 'some url',
                    type: 'image2/ico',
                    size: 151515,
                    lastModified: ( new Date() ).toString()
                } ]
                , userId = userId_1
                , accountId = 0;

            Service
                .createFiles( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.ok;
                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result[0] ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to create some files with an error for others', function ( done ) {

            var data = [
                    {
                        name: 'someFile3.ico',
                        url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og5',
                        type: 'image/ico',
                        size: 151515,
                        lastModified: ( new Date() ).toString()
                    },
                    {
                        name: 'someFile4.ico',
                        type: 'image/ico',
                        size: 151515,
                        lastModified: ( new Date() ).toString()
                    }
                ]
                , userId = userId_1
                , accountId = 1;

            Service
                .createFiles( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.have.length( 2 );
                    expect( result[0] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[1] ).to.be.an( 'object' ).and.be.ok;
                    expect( result[1] ).to.have.property( 'statuscode' ).and.equal( 400 );
                    expect( result[1] ).to.have.property( 'message' ).and.be.ok;

                    done();
                }, done );
        } );

    });

    describe( '.getFailByIds( userId, accountId, fileId )', function () {

        it( 'should be able to find file by userId, accountId and fileId', function ( done ) {

            var  userId = userId_1
              , accountId = 1
              , fileId = fileId_1;

            Service
                .getFailByIds( userId, accountId, fileId )
                .then( function( file ) {

                    expect( file ).to.be.an( 'object' );
                    expect( file ).to.have.property( 'id' ).and.equal( fileId );
                    expect( file ).to.have.property( 'name' ).and.equal( 'someFile.ico' );
                    expect( file ).to.have.property( 'url' ).and.equal( 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og' );
                    expect( file ).to.have.property( 'size' ).and.equal( 151515 );
                    expect( file ).to.have.property( 'AccountId' ).and.equal( accountId );
                    expect( file ).to.have.property( 'UserId' ).and.equal( userId );

                    done();
                }, done );
        } );

        it( 'should be able to get the error if fileId do not exist', function ( done ) {

            var  userId = userId_1
              , accountId = 1
              , fileId = 151515151515151;

            Service
                .getFailByIds( userId, accountId, fileId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                })
                .fail( done );
        } );

    });

    describe( '.updateFile( userId, accountId, fileId, data )', function () {

        it( 'should be able to update file', function ( done ) {

            var data = {
                    id: fileId_1,
                    name: 'someFileUpdated.ico',
                    url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7asasasa',
                    type: 'image2/ico',
                    lastModified: ( new Date() ).toString()
                }
              , userId = userId_1
              , accountId = 1
              , fileId = fileId_1;

            Service
                .updateFile( userId, accountId, fileId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( fileId_1 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );

                    Model
                        .find( fileId )
                        .success( function( file ) {

                            expect( file ).to.be.an( 'object' );
                            expect( file ).to.have.property( 'id' ).and.equal( fileId_1 );
                            expect( file ).to.have.property( 'name' ).and.equal( data.name );
                            expect( file ).to.have.property( 'url' ).and.equal( data.url );
                            expect( file ).to.have.property( 'type' ).and.equal( data.type );
                            expect( file ).to.have.property( 'lastModified' ).and.be.ok;
                            expect( ( new Date ( file.lastModified ) ).toString() ).to.equal( ( new Date( data.lastModified ) ).toString() );
                            expect( file ).to.have.property( 'size' ).and.equal( 151515 );

                            done();
                        })
                        .error( done );
                });
        } );

        it( 'should be able to get the error if fileId do not exist', function ( done ) {

            var data = {
                    id: 1515151515,
                    name: 'someFileUpdated.ico',
                    url: 'https://www.filepicker.io/api/file/qwqwqwqwq',
                    type: 'image2/ico',
                    lastModified: ( new Date() ).toString()
                }
                , userId = userId_1
                , accountId = 1
                , fileId = 1515151515;

            Service
                .createFiles( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                })
                .fail( done );
        } );

        it( 'should be able to get the error if fileId and data.id does not match', function ( done ) {

            var data = {
                    id: 16161616,
                    name: 'someFileUpdated.ico',
                    url: 'https://www.filepicker.io/api/file/qwqwqwqw',
                    type: 'image2/ico',
                    lastModified: ( new Date() ).toString()
                }
                , userId = userId_1
                , accountId = 1
                , fileId = 1515151515;

            Service
                .createFiles( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                })
                .fail( done );
        } );

        it( 'should be able to get the error if the file with such url already exist', function ( done ) {

            var data = {
                    id: fileId_1,
                    name: 'someFileUpdated.ico',
                    url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og1',
                    type: 'image2/ico',
                    lastModified: ( new Date() ).toString()
                }
                , userId = userId_1
                , accountId = 1
                , fileId = fileId_1;

            Service
                .createFiles( userId, accountId, data )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done();
                })
                .fail( done );
        } );

    });

    describe( '.listFiles( accountId )', function () {

        it( 'should be able to find all files by accountId', function ( done ) {

            var accountId = 1;

            Service
                .listFiles( accountId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.not.empty;
                    expect( result ).to.have.length.above( 2 );

                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'name' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'url' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'lastModified' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'UserId' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'AccountId' ).and.equal( accountId );
                    expect( result[0] ).to.have.property( 'username' ).and.be.ok;

                    done();
                }, done )
        } );

        it( 'should be able to give us an empty array if no files for accountId', function ( done ) {

            Service
                .listFiles( 10000 )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.empty;

                    done();
                }, done )
        } );

    } );

    describe( '.listFilesForUser( userId, accountId )', function () {

        it( 'should be able to find all files by accountId and userId', function ( done ) {

            var accountId = 1
              , userId = userId_1;

            Service
                .listFilesForUser( userId, accountId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.not.empty;
                    expect( result ).to.have.length.above( 2 );

                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'name' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'url' ).and.be.ok;
                    expect( result[0] ).to.have.property( 'lastModified' ).and.be.ok;
                    expect( result[0] ).to.not.have.property( 'UserId' );
                    expect( result[0] ).to.not.have.property( 'AccountId' );
                    expect( result[0] ).to.not.have.property( 'username' );

                    done();
                }, done )
        } );

        it( 'should be able to give us an empty array if no files for accountId', function ( done ) {

            var accountId = 1000
              , userId = userId_1;

            Service
                .listFilesForUser( userId, accountId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.empty;

                    done();
                }, done )
        } );

        it( 'should be able to give us an empty array if no files for userId', function ( done ) {

            var accountId = 1
              , userId = userId_1 + 10000;

            Service
                .listFilesForUser( userId, accountId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'array' ).and.be.empty;

                    done();
                }, done )
        } );

    } );

    describe( '.deleteFile( userId, accountId, fileId )', function () {

        it( 'should be able to get the error if the fileId does not exist', function ( done ) {

            var userId = userId_1
              , accountId = 1
              , fileId = fileId_1 + 1000;

            Service
                .deleteFile( userId, accountId, fileId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Service
                        .findById( fileId_1 )
                        .then( function( file ) {

                            expect( file ).to.be.an( 'object' ).and.be.ok;
                            expect( file ).to.have.property( 'id' ).and.equal( fileId_1 );

                            done();
                        })
                        .fail( done );
                }, done )
        } );

        it( 'should be able to get the error if email does not belong to the user or account', function ( done ) {

            var userId = userId_1
              , accountId = 1000
              , fileId = fileId_1;

            Service
                .deleteFile( userId, accountId, fileId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Service
                        .findById( fileId_1 )
                        .then( function( file ) {

                            expect( file ).to.be.an( 'object' ).and.be.ok;
                            expect( file ).to.have.property( 'id' ).and.equal( fileId_1 );

                            done();
                        })
                        .fail( done );
                }, done )
        } );

        it( 'should be able to get the error if email does not belong to the user or account', function ( done ) {

            var userId = userId_1 + 1000
              , accountId = 1
              , fileId = fileId_1;

            Service
                .deleteFile( userId, accountId, fileId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    Service
                        .findById( fileId_1 )
                        .then( function( file ) {

                            expect( file ).to.be.an( 'object' ).and.be.ok;
                            expect( file ).to.have.property( 'id' ).and.equal( fileId_1 );

                            done();
                        })
                        .fail( done );
                }, done )
        } );

        it( 'should be able to delete file', function ( done ) {

            var userId = userId_1
              , accountId = 1
              , fileId = fileId_1;

            Service
                .deleteFile( userId, accountId, fileId )
                .then( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );

                    Service
                        .findById( fileId_1 )
                        .then( function( file ) {

                            expect( file ).to.not.be.ok;

                            done();
                        })
                        .fail( done );
                }, done )
        } );

    } );

} );