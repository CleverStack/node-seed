// Bootstrap the testing environmen
var testEnv = require( 'utils' ).testEnv();

var expect = require( 'chai' ).expect
  , Q = require ( 'q' )
  , Service;

var userId, fileId;

describe( 'controllers.FileController', function () {
    var ctrl;

    before( function ( done ) {
        testEnv( function ( FileController, FileService, ORMUserModel ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            ctrl = new FileController( req, res, next );

            Service = FileService;

            UserModel = ORMUserModel;

            done();
        } );
    } );


    describe( '.postAction()', function () {

        before ( function( done ) {

            var user_1 = { username: 'voffka', email: 'voffka@mail.ru', password: '1234', firstname: 'vova', lastname: 'petrov' };

            UserModel
                .create( user_1 )
                .success( function( user ) {

                    expect( user ).to.be.an( 'object' );
                    expect( user ).to.have.property( 'id' ).and.be.ok;
                    expect( user ).to.have.property( 'username' ).and.equal( user_1.username );

                    userId = user.id;

                    done();
                })
                .error( done );
        });

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
            ];

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                var promise = [
                    Service.find( { where: { url: data[0].url } } ),
                    Service.find( { where: { url: data[1].url } } )
                ];

                Q.all( promise )
                    .then( function ( files ) {

                        expect( files ).to.be.an( 'array' ).and.have.length( 2 );
                        expect( files[0] ).to.be.an( 'array' ).and.have.length( 1 );
                        expect( files[1] ).to.be.an( 'array' ).and.have.length( 1 );

                        files[0] = files[0][0];
                        files[1] = files[1][0];

                        expect( files[0] ).to.be.an( 'object' );
                        expect( files[0] ).to.have.property( 'id' ).and.be.ok;
                        expect( files[0] ).to.have.property( 'name' ).and.equal( data[0].name );
                        expect( files[0] ).to.have.property( 'url' ).and.equal( data[0].url );

                        expect( files[1] ).to.be.an( 'object' );
                        expect( files[1] ).to.have.property( 'name' ).and.equal( data[1].name );
                        expect( files[1] ).to.have.property( 'url' ).and.equal( data[1].url );

                        fileId = files[0].id;

                        done();

                    }, done );
            };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1
                }
            };
            ctrl.postAction();
        } );

        it( 'should be able to get the error if insufficient data', function ( done ) {

            var data = [ {
                name: 'someFile2.ico',
                url: 'some url',
                type: 'image2/ico',
                size: 151515,
                lastModified: ( new Date() ).toString()
            } ];

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect( data ).to.be.an( 'array' ).and.be.ok;
                expect( data[0] ).to.be.an( 'object' );
                expect( data[0] ).to.have.property( 'statuscode' ).and.equal( 400 );
                expect( data[0] ).to.have.property( 'message' ).and.be.ok;

                done();
            };

            ctrl.req.body = data;

            ctrl.req.user = {
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1
                }
            };
            ctrl.postAction();
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
            ];

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect( data ).to.be.an( 'array' ).and.have.length( 2 );
                expect( data[0] ).to.be.an( 'object' ).and.be.ok;
                expect( data[0] ).to.have.property( 'id' ).and.be.ok;
                expect( data[1] ).to.be.an( 'object' ).and.be.ok;
                expect( data[1] ).to.have.property( 'statuscode' ).and.equal( 400 );
                expect( data[1] ).to.have.property( 'message' ).and.be.ok;

                done();
            };

            ctrl.req.body = data;

            ctrl.req.user = {
                id: userId,
                firstname: 'Vitalis',
                lastname: 'Popkin',
                account: {
                    id:1
                }
            };
            ctrl.postAction();
        } );

    } );

    describe( '.listAction()', function () {

        it( 'should be able to find all files by accountId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.not.empty;
                expect( result ).to.have.length.above( 2 );

                expect( result[0] ).to.be.an( 'object' );
                expect( result[0] ).to.have.property( 'id' ).and.be.ok;
                expect( result[0] ).to.have.property( 'name' ).and.be.ok;
                expect( result[0] ).to.have.property( 'url' ).and.be.ok;
                expect( result[0] ).to.have.property( 'lastModified' ).and.be.ok;
                expect( result[0] ).to.have.property( 'UserId' ).and.be.ok;
                expect( result[0] ).to.have.property( 'AccountId' ).and.equal( 1 );
                expect( result[0] ).to.have.property( 'username' ).and.be.ok;

                done();
            };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.listAction();
        } );

        it( 'should be able to give us an empty array if no files for accountId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1000
                }
            };

            ctrl.listAction();
        } );

        it( 'should be able to find all files by accountId and userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

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
            };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.req.query = { userId: userId };

            ctrl.listAction();
        } );

        it( 'should be able to give us an empty array if no files for accountId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1000
                }
            };

            ctrl.req.query = { userId: userId };

            ctrl.listAction();
        } );

        it( 'should be able to give us an empty array if no files for userId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.be.empty;

                done();
            };

            ctrl.req.user = {
                id: userId + 1000,
                account: {
                    id: 1
                }
            };

            ctrl.req.query = { userId: userId + 1000 };

            ctrl.listAction();
        } );

    } );

    describe( '.getAction()', function () {

        it( 'should be able to find file by userId, accountId and fileId', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' ).and.equal( fileId );
                expect( result ).to.have.property( 'name' ).and.equal( 'someFile3.ico' );
                expect( result ).to.have.property( 'url' ).and.equal( 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og1' );
                expect( result ).to.have.property( 'size' ).and.equal( 151515 );
                expect( result ).to.have.property( 'AccountId' ).and.equal( 1 );
                expect( result ).to.have.property( 'UserId' ).and.equal( userId );

                done();
            };

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if fileId do not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 151515 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if file does not belong to the user and account', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: 1212,
                account: {
                    id:1
                }
            };

            ctrl.getAction();
        } );

        it( 'should be able to get the error if file does not belong to the user and account', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1000
                }
            };

            ctrl.getAction();
        } );

    } );

    describe( '.putAction()', function () {

        it( 'should be able to update file', function ( done ) {

            var data = {
                id: fileId,
                name: 'someFileUpdated.ico',
                url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7asasasa',
                type: 'image2/ico',
                lastModified: ( new Date() ).toString()
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 200 );

                expect( data ).to.be.an( 'object' );
                expect( data ).to.have.property( 'id' ).and.equal( fileId );
                expect( data ).to.have.property( 'name' ).and.equal( data.name );

                Service
                    .findById( fileId )
                    .then( function( file ) {

                        expect( file ).to.be.an( 'object' );
                        expect( file ).to.have.property( 'id' ).and.equal( fileId );
                        expect( file ).to.have.property( 'name' ).and.equal( data.name );
                        expect( file ).to.have.property( 'url' ).and.equal( data.url );
                        expect( file ).to.have.property( 'type' ).and.equal( data.type );
                        expect( file ).to.have.property( 'lastModified' ).and.be.ok;
                        expect( ( new Date ( file.lastModified ) ).toString() ).to.equal( ( new Date( data.lastModified ) ).toString() );
                        expect( file ).to.have.property( 'size' ).and.equal( 151515 );

                        done();
                    })
                    .fail( done );
            };

            ctrl.req.body = data;

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };
            ctrl.putAction();
        } );

        it( 'should be able to get the error if fileId do not exist', function ( done ) {

            var data = {
                id: 15151515,
                name: 'someFileUpdated.ico',
                url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7asasasa',
                type: 'image2/ico',
                lastModified: ( new Date() ).toString()
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.body = data;

            ctrl.req.params = { id: 15151515 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };
            ctrl.putAction();
        } );

        it( 'should be able to get the error if fileId and data.id does not match', function ( done ) {

            var data = {
                id: fileId + 1,
                name: 'someFileUpdated.ico',
                url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7asasasa',
                type: 'image2/ico',
                lastModified: ( new Date() ).toString()
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.body = data;

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };
            ctrl.putAction();
        } );

        it( 'should be able to get the error if the file with such url already exist', function ( done ) {

            var data = {
                id: fileId,
                name: 'someFileUpdated.ico',
                url: 'https://www.filepicker.io/api/file/cjc2UAn5SMe7rguo05og2',
                type: 'image2/ico',
                lastModified: ( new Date() ).toString()
            };

            ctrl.send = function ( data, status ) {

                expect( status ).to.equal( 403 );

                expect( data ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.body = data;

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id: 1
                }
            };
            ctrl.putAction();
        } );

    } );


    describe( '.deleteAction()', function () {

        it( 'should be able to get the error if the fileId does not exist', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: 15151515515 };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to get the error if email does not belong to the user or account', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1000
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to get the error if email does not belong to the user or account', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                done();
            };

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId + 1,
                account: {
                    id: 1
                }
            };

            ctrl.deleteAction();
        } );

        it( 'should be able to delete file', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.be.ok;

                Service
                    .findById( fileId )
                    .then( function( file ) {

                        expect( file ).to.not.be.ok;

                        done();
                    })
                    .fail( done );
            };

            ctrl.req.params = { id: fileId };

            ctrl.req.user = {
                id: userId,
                account: {
                    id:1
                }
            };

            ctrl.deleteAction();
        } );

    } );
} );