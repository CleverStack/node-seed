var Q = require( 'q' )
  , FileService = null;

module.exports = function ( sequelize,
                            ORMFileModel,
                            ORMUserModel ) {

    if ( FileService && FileService.instance ) {
        return FileService.instance;
    }

    FileService = require( 'services' ).BaseService.extend( {

        normalizeData: function( file ) {

            var f = {
                id: file.id,
                name: file.name,
                type: file.type,
                url: file.url,
                size: file.size,
                lastModified: file.lastModified
            };

            if ( !!file.user ) {
                f.UserId = file.UserId;
                f.AccountId = file.AccountId;
                f.username = [ file.user.firstname, file.user.lastname ].join( ' ' );
            }

            return f;
        },

        listFiles: function ( accountId ) {
            var deferred = Q.defer()
              , service = this;

            service
                .find( { where: { AccountId: accountId, "deletedAt": null }, include: [ ORMUserModel ] } )
                .then( function ( files ) {

                    if ( !!files && !!files.length ) {
                        deferred.resolve( files.map( service.normalizeData ) );
                    } else {
                        deferred.resolve( [] );
                    }
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        listFilesForUser: function ( userId, accountId ) {
            var deferred = Q.defer()
              , service = this;

            service
                .find( { where: { UserId: userId, AccountId: accountId, "deletedAt": null } } )
                .then( function ( files ) {

                    if ( !!files && !!files.length ) {
                        deferred.resolve( files.map( service.normalizeData ) );
                    } else {
                        deferred.resolve( [] );
                    }
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        getFailByIds: function ( userId, accountId, fileId ) {
            var deferred = Q.defer();

            ORMFileModel
                .find( { where: { UserId: userId, AccountId: accountId, id: fileId } } )
                .success( function ( file ) {

                    if ( !file || !file.id ) {
                        deferred.resolve( { statuscode: 403, message: 'invalid' } );
                    } else {
                        deferred.resolve( file );
                    }
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        createFile: function ( userId, accountId, file ) {
            var deferred = Q.defer()
              , service = this;

            if ( !file.name || !file.url || !file.type || !file.size || !file.lastModified || !userId || !accountId ) {

                deferred.resolve( { statuscode: 400, message: 'insufficient data' } );

            } else {

                ORMFileModel
                    .find( { where: { url: file.url } } )
                    .success( function( result ) {

                        if ( !!result && !!result.id ){
                            deferred.resolve( { statuscode: 403, message: 'invalid' } );
                            return;
                        }

                        file.UserId = userId;
                        file.AccountId = accountId;

                        service
                            .create ( file )
                            .then( function( newFile ) {
                                deferred.resolve( service.normalizeData( newFile ) );
                            })
                            .fail( deferred.reject );
                    })
                    .error( deferred.reject );
            }

            return deferred.promise;
        },

        createFiles: function ( userId, accountId, files ) {
            var deferred = Q.defer()
              , service = this;

            if ( !!files && !!files.length ){
                var promises = [];

                files.forEach( function( file ) {
                    promises.push( service.createFile( userId, accountId, file ) );
                });

                Q.all( promises )
                    .then( deferred.resolve )
                    .fail( deferred.reject )
            } else {
                deferred.resolve( { statuscode: 403, message: 'invalid' } );
            }

            return deferred.promise;
        },

        updateFile: function ( userId, accountId, fileId, data ) {
            var deferred = Q.defer()
              , service = this;

            if ( fileId != data.id ){
                deferred.resolve( { statuscode: 403, message: 'invalid' } );
            } else {
                service
                    .getFailByIds( userId, accountId, fileId )
                    .then( function ( file ) {

                        ORMFileModel
                            .find( { where: { url: data.url } } )
                            .success( function( result ) {

                                if ( !!result && !!result.id && result.id != data.id ){
                                    deferred.resolve( { statuscode: 403, message: 'invalid' } );
                                    return;
                                }

                                file
                                    .updateAttributes( data )
                                    .success( function ( file ) {
                                        deferred.resolve ( service.normalizeData( file ) );
                                    } )
                                    .error( deferred.reject );
                            })
                            .error( deferred.reject );
                    } )
                    .fail( deferred.reject );
            }

            return deferred.promise;
        },

        deleteFile: function ( userId, accountId, fileId ) {
            var deferred = Q.defer();

            this
                .getFailByIds( userId, accountId, fileId )
                .then( function ( result ) {

                    if ( !result || !result.id ) {
                        deferred.resolve( result );
                    } else {
                        var file = result;

                        file.destroy()
                            .success( function () {
                                deferred.resolve( {statuscode: 200, message: 'ok'} );
                            } )
                            .error( deferred.reject );
                    }
                } )
                .fail( deferred.reject );

            return deferred.promise;
        }

    } );

    FileService.instance = new FileService( sequelize );
    FileService.Model = ORMFileModel;

    return FileService.instance;
};