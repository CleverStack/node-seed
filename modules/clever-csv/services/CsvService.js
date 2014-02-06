var Q = require ( 'q' )
  , fs = require ( 'fs' )
  , lev = require ( 'levenshtein' )
  , _ = require ( 'lodash' )
  , async = require ( 'async' )
  , csv = require ( 'csv' )
  , path = require ( 'path' )
  , config = require ( 'config' )[ 'clever-csv' ]
  , http = require ( 'http' )
  , CsvService = null;

var schema;

module.exports = function () {

    if ( CsvService && CsvService.instance ) {
        return CsvService.instance;
    }

    CsvService = require( 'services' ).BaseService.extend( {

        uploadFromFile: function ( filepath, options ) {
            var deferred = Q.defer ()
              , options = options || {};

            if ( fs.existsSync ( filepath ) ) {

                csv ()
                    .from.path ( filepath, options )
                    .to.array ( function ( data ) {
                        deferred.resolve ( data )
                    } )
                    .on ( 'error', function ( err ) {
                        deferred.reject ( err.toString() );
                    } );
            } else {
                deferred.reject ( 'Error: no such file' );
            }

            return deferred.promise;
        },

        getAllPossibleTypes: function () {
            var deferred = Q.defer ()
              , typesPath = config.pathToCsvSchemaFiles
              , result = [];

            if ( fs.existsSync ( typesPath ) ) {

                fs.readdir ( typesPath, function ( err, files ) {

                    if ( !!err ) {
                        deferred.reject ( err );
                    } else {

                        files
                            .forEach ( function ( typeFile ) {
                                if ( path.extname ( typeFile ) === '.json' ) {
                                    var file = [ typesPath, typeFile ].join( '' )
                                      , data = fs.readFileSync ( file, 'utf8' );

                                    result.push ( JSON.parse ( data ) );
                                }
                            } );

                        deferred.resolve ( result );
                    }
                } );
            } else {
                deferred.resolve( { statuscode: 403, message: 'no such directory' } );
            }

            return deferred.promise;
        },

        readCsvSchemaFile: function( type ) {
            var deferred = Q.defer()
              , file = [ config.pathToCsvSchemaFiles, type, '.json' ].join ( '' );

            if ( fs.existsSync ( file ) ) {

                fs.readFile( file, 'utf8', function ( err, data ) {
                    if ( !!err ) {
                        deferred.reject ( err );
                    } else {
                        deferred.resolve ( { schema: JSON.parse ( data ) } );
                    }
                });

            } else {
                deferred.reject ( 'Error: no such file' );
            }

            return deferred.promise;
        },

        readCsvFileByUrl: function ( url, filename ) {
            var deferred = Q.defer ()
              , filename = filename || ''
              , prefix = +new Date
              , newPath = !!filename
                    ? [ config.pathToCsvFiles, prefix, '_', filename, '.csv' ].join( '' )
                    : [ config.pathToCsvFiles, prefix, '.csv' ].join( '' );

            if ( fs.existsSync ( config.pathToCsvFiles ) ) {
                var file = fs.createWriteStream ( newPath );

                http
                    .get ( url, function ( response ) {
                        var r = response.pipe ( file );
                        r.on ( 'finish', function () {
                            deferred.resolve ( { path: newPath } );
                        } );
                    } ).on ( 'error', function ( err ) {
                        deferred.reject ( err );
                    } );
            } else {
                deferred.reject ( 'Error: no such directory' );
            }



            return deferred.promise;
        },

        guessHeadersByName: function ( obj ) {
            var deferred = Q.defer ()
              , headers = obj.csv[0]
              , requiredHeaders = _.pluck ( obj.schema.fields, 'display' )
              , mapping = []
              , matrix = [];

            headers.forEach ( function ( header, i ) {
                var dist = []
                  , els = [];

                requiredHeaders.forEach ( function( possibleHeader, j ) {
                    dist.push ( {
                        ind: i,
                        j: j,
                        lev: lev ( header, possibleHeader ),
                        possible: possibleHeader
                    } );

                });

                dist.sort ( function ( a, b ) {
                    if ( a.lev < b.lev ) return -1;
                    if ( a.lev > b.lev ) return 1;
                    return 0;
                } );

                var value = obj.csv[ 1 ][ dist[ i ].ind ];

                for ( var k in dist ) {
                    el = dist[ k ].possible;
                    els.push ( [ dist[ k ].j, el ] );
                }

                els.push( [ -1, "--Not Match--" ] );

                matrix.push ( { value: value, possible: els } );
            });

            deferred.resolve ( matrix );

            return deferred.promise;
        },

        handleExamineProcess: function ( data ) {
            var deferred = Q.defer ()
              , service = this
              , result = {}
              , schema, path;

            service
                .readCsvSchemaFile ( data.type )
                .then ( function( res ) {
                    schema = res.schema;
                    return service.readCsvFileByUrl ( data.url, data.filename )
                })
                .then ( function( res ) {
                    path = res.path;
                    return service.uploadFromFile ( path, data.options )
                })
                .then ( function( csv ) {
                    return service.guessHeadersByName ( { csv: csv, schema: schema } )
                })
                .then ( function( column ) {
                    deferred.resolve ( {columns: column, tmpCsvPath: path } );
                })
                .fail ( deferred.reject );

            return deferred.promise;
        },

        reorganizeDataByColumns: function ( data ) {
            var deferred = Q.defer ()
              , result = {
                    columns: [],
                    data: []
                };

            //columns
            data.columns
                .forEach( function ( ind ) {

                    ind = parseInt ( ind );

                    if ( ind >= 0 ) {
                        var field = data.schema.fields[ ind ];

                        result.columns.push ( {
                            titleReadable: field.display,
                            title: field.name,
                            type: field.type
                        } );
                    }
                });

            //data from csv
            data.csv
                .forEach( function ( row, rowNum ) {
                    if ( rowNum !== 0 ) {

                        var el = {};

                        data.columns
                            .forEach( function ( ind, i ) {

                                ind = parseInt ( ind );

                                if ( ind >= 0 ) {
                                    var field = data.schema.fields[ i ].name;
                                    el[ field ] = data.csv[ rowNum ][ ind ];
                                }
                            });

                        result.data.push ( el );
                    }
                });

            deferred.resolve ( result );

            return deferred.promise;
        },

        handleSubmitDraftProcess: function ( data ) {
            var deferred = Q.defer ()
                , service = this
                , schema;

            service
                .readCsvSchemaFile ( data.type )
                .then ( function( res ) {
                    schema = res.schema;
                    return service.uploadFromFile ( data.path, data.options )
                })
                .then ( function( csv ) {
                    return service.reorganizeDataByColumns ( { csv: csv, schema: schema, columns: data.columns } )
                })
                .then ( function( result ) {
                    deferred.resolve ( result );
                })
                .fail ( deferred.reject );

            return deferred.promise;
        },

        saveData: function ( schema, data ) {
            var deferred = Q.defer ()
              , service = schema.service
              , method = schema.method
              , result = {};

            injector._resolve ( service, function ( err, name, _service ) {
                if ( !!err ) {
                    deferred.resolve ( { statuscode: 500, message: err.toString() } );
                } else {
                    async.eachSeries ( data, function ( row, next ) {
                        _service[ method ] ( { row: row } ).then ( function () {
                            next ();
                        }, next );
                    }, function ( err ) {
                        if ( !!err ) {
                            deferred.resolve ( { statuscode: 500, message: err.toString() } );
                        } else {
                            deferred.resolve ( { statuscode: 200, message: 'data has been saved' } );
                        }
                    } );
                }

            } );

            return deferred.promise;
        },

        handleSubmitFinalProcess: function ( data ) {
            var deferred = Q.defer ()
              , service = this
              , schema;

            service
                .readCsvSchemaFile ( data.type )
                .then ( function( res ) {
                    schema = res.schema;
                    return service.uploadFromFile ( data.path, data.options )
                })
                .then ( function( csv ) {
                    return service.reorganizeDataByColumns ( { csv: csv, schema: schema, columns: data.columns } )
                })
                .then ( function( prData ) {
                    return service.saveData ( schema, prData.data )
                })
                .then ( function( result ) {
                    deferred.resolve ( result );
                })
                .fail ( deferred.reject );

            return deferred.promise;
        }

    } );

    CsvService.instance = new CsvService ();

    return CsvService.instance;
};
