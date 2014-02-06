var expect = require ( 'chai' ).expect
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , testEnv = require ( 'utils' ).testEnv()
  , sinon = require( 'sinon' )
  , fs = require ( 'fs' )
  , Q = require ( 'q' )
  , config = require ( 'config' )[ 'clever-csv' ];

var csv_1;

describe( 'service.CsvService', function () {
    var Service;

    before( function ( done ) {
        testEnv( function ( _CsvService_ ) {

            Service = _CsvService_;

            done();
        }, done );
    } );

    describe( '.uploadFromFile( filepath, options )', function () {

        it( 'should be able to convert info from file to an array without options', function ( done ) {

            var filepath = [ config.pathToTestCsvFiles, 'test_file_1.csv' ].join( '' );

            expect( fs.existsSync ( filepath ) ).to.be.true;

            Service
                .uploadFromFile( filepath )
                .then( function ( data ) {

                    expect ( data ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[0] ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[1] ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[2] ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[3] ).to.be.an ( 'array' ).and.have.length ( 4 );

                    expect ( data ).to.have.deep.property ( '[0][0]', '1' );
                    expect ( data ).to.have.deep.property ( '[1][1]', 'b1' );
                    expect ( data ).to.have.deep.property ( '[2][2]', 'c2' );
                    expect ( data ).to.have.deep.property ( '[3][3]', 'd3' );

                    done();
                }, done );
        } );

        it( 'should be able to convert info from file to an array with options', function ( done ) {

            var filepath = [ config.pathToTestCsvFiles, 'test_file_2.csv' ].join( '' )
              , options = {
                    delimiter: ';',
                    comment: '#'
                };

            expect( fs.existsSync ( filepath ) ).to.be.true;

            Service
                .uploadFromFile( filepath, options )
                .then( function ( data ) {

                    expect ( data ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[0] ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[1] ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[2] ).to.be.an ( 'array' ).and.have.length ( 4 );
                    expect ( data[3] ).to.be.an ( 'array' ).and.have.length ( 4 );

                    expect ( data ).to.have.deep.property ( '[0][0]', '1' );
                    expect ( data ).to.have.deep.property ( '[1][1]', 'b1' );
                    expect ( data ).to.have.deep.property ( '[2][2]', 'c2' );
                    expect ( data ).to.have.deep.property ( '[3][3]', 'd3' );

                    done();
                }, done );
        } );

        it( 'should be able get error if file have not valid info', function ( done ) {

            var filepath = [ config.pathToTestCsvFiles, 'test_file_1.csv' ].join( '' )
              , options = {
                    delimiter: ';',
                    comment: '#'
                };

            expect( fs.existsSync ( filepath ) ).to.be.true;

            Service
                .uploadFromFile( filepath, options )
                .then( done )
                .fail ( function( err ) {

                    expect ( err ).to.be.a( 'string' ).and.have.length.above( 0 );

                    done();
                })
        } );

        it( 'should be able get error if file do not exist', function ( done ) {

            var filepath = [ config.pathToTestCsvFiles, 'test_file_3.csv' ].join( '' );

            expect( fs.existsSync ( filepath ) ).to.be.false;

            Service
                .uploadFromFile( filepath )
                .then( done )
                .fail ( function( err ) {

                    expect ( err ).to.be.a( 'string' ).and.have.length.above( 0 );
                    expect ( err ).to.equal( 'Error: no such file' );

                    done();
                });
        } );

    } );

    describe( '.getAllPossibleTypes()', function () {

        it( 'should be able to find all possible types', function ( done ) {

            var typesPath = config.pathToCsvSchemaFiles;

            expect( fs.existsSync ( typesPath ) ).to.be.true;

            Service
                .getAllPossibleTypes()
                .then( function ( data ) {

                    expect ( data ).to.be.a ( 'array' ).and.be.ok;

                    if ( fs.readdirSync ( typesPath ).length > 0 ) {

                        var type = data[0];

                        expect ( type ).to.be.a( 'object' ).and.be.ok;
                        expect ( type ).to.have.property ( 'name' ).and.be.ok;
                        expect ( type ).to.have.property ( 'description' ).and.be.ok;
                        expect ( type ).to.have.property ( 'service' ).and.be.ok;
                        expect ( type ).to.have.property ( 'method' ).and.be.ok;
                        expect ( type ).to.have.property ( 'fields' ).and.be.an( 'array' );

                    }

                    done();
                }, done );
        } );

        it( 'should be able to get empty array if directory do not have necessary files', function ( done ) {

            var old_path = config.pathToCsvSchemaFiles;

            config.pathToCsvSchemaFiles = './modules/';

            var typesPath = config.pathToCsvSchemaFiles;

            expect( old_path ).to.not.equal ( typesPath );
            expect( fs.existsSync ( typesPath ) ).to.be.true;

            Service
                .getAllPossibleTypes()
                .then( function ( data ) {

                    expect ( data ).to.be.a ( 'array' ).and.be.empty;

                    config.pathToCsvSchemaFiles = old_path;

                    done();
                }, done );
        } );

        it( 'should be able get error if directory do not exist', function ( done ) {

            var old_path = config.pathToCsvSchemaFiles;

            config.pathToCsvSchemaFiles = old_path + 'asasasasa/';

            var typesPath = config.pathToCsvSchemaFiles;

            expect( old_path ).to.not.equal ( typesPath );
            expect( fs.existsSync ( typesPath ) ).to.be.false;

            Service
                .getAllPossibleTypes()

                .then ( function( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    config.pathToCsvSchemaFiles = old_path;

                    done();
                })
                .fail( done );
        } );

    } );

    describe( '.readCsvSchemaFile( type )', function () {

        it( 'should be able to get necessary schema', function ( done ) {

            var typesPath = config.pathToCsvSchemaFiles;
            var type = 'exampleEmployee';

            expect( fs.existsSync ( typesPath ) ).to.be.true;
            expect( fs.existsSync ( [ typesPath, type, '.json' ].join ( '' ) ) ).to.be.true;

            Service
                .readCsvSchemaFile( type )
                .then( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'schema' ).and.be.ok;

                    var type = result.schema;

                    expect ( type ).to.be.a( 'object' ).and.be.ok;
                    expect ( type ).to.have.property ( 'name' ).and.be.ok;
                    expect ( type ).to.have.property ( 'description' ).and.be.ok;
                    expect ( type ).to.have.property ( 'service' ).and.be.ok;
                    expect ( type ).to.have.property ( 'method' ).and.be.ok;
                    expect ( type ).to.have.property ( 'fields' ).and.be.an( 'array' );

                    done();
                }, done );
        } );

        it( 'should be able get error if file do not exist', function ( done ) {

            var typesPath = config.pathToCsvSchemaFiles;
            var type = 'notExistingSchema';

            expect( fs.existsSync ( typesPath ) ).to.be.true;
            expect( fs.existsSync ( [ typesPath, type, '.json' ].join ( '' ) ) ).to.be.false;

            Service
                .readCsvSchemaFile( type )
                .then( done )
                .fail ( function( err ) {

                    expect ( err ).to.be.a( 'string' ).and.have.length.above( 0 );

                    done();
                });
        } );

    } );

    describe( '.readCsvFileByUrl( url, filename )', function () {

        it( 'should be able to read csv file from url and save it with default name', function ( done ) {

            var filePath = config.pathToCsvFiles
              , url = config.urlToTestCsvFile; //i upload file before

            expect( fs.existsSync ( filePath ) ).to.be.true;

            Service
                .readCsvFileByUrl( url )
                .then( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'path' ).and.be.ok;
                    expect ( result.path ).to.contain( filePath );
                    expect ( result.path ).to.contain( '.csv' );

                    expect( fs.existsSync ( result.path ) ).to.be.true;

                    done();
                }, done );
        } );

        it( 'should be able to read csv file from url and save it with specific name', function ( done ) {

            var filePath = config.pathToCsvFiles
              , url = config.urlToTestCsvFile //i upload file before
              , filename = 'myFileName';

            expect( fs.existsSync ( filePath ) ).to.be.true;

            Service
                .readCsvFileByUrl( url, filename )
                .then( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'path' ).and.be.ok;
                    expect ( result.path ).to.contain( filePath );
                    expect ( result.path ).to.contain( filename );
                    expect ( result.path ).to.contain( '.csv' );

                    expect( fs.existsSync ( result.path ) ).to.be.true;

                    done();
                }, done );
        } );

        it( 'should be able get error if directory do not exist', function ( done ) {

            var old_path = config.pathToCsvFiles;

            config.pathToCsvFiles = old_path + 'asasasasa/';

            var filePath = config.pathToCsvFiles
                , url = config.urlToTestCsvFile; //i upload file before

            expect( old_path ).to.not.equal ( filePath );
            expect( fs.existsSync ( filePath ) ).to.be.false;

            Service
                .readCsvFileByUrl( url )
                .then( done )
                .fail ( function( err ) {

                    expect ( err ).to.be.a( 'string' ).and.have.length.above( 0 );

                    config.pathToCsvFiles = old_path;

                    done();
                });

        } );

    } );

    describe( '.guessHeadersByName( obj )', function () {

        it( 'should be able to return data with the most probable headers', function ( done ) {

            var filepath = [ config.pathToTestCsvFiles, 'examplePersonal.csv' ].join( '' )
              , type = 'exampleEmployee';

            expect( fs.existsSync ( filepath ) ).to.be.true;
            expect( fs.existsSync ( [ config.pathToCsvSchemaFiles, type, '.json' ].join ( '' ) ) ).to.be.true;

            Service
                .uploadFromFile( filepath )
                .then( function ( csv ) {

                    expect ( csv ).to.be.an ( 'array' ).and.have.length.above ( 1 );
                    expect ( csv[0] ).to.be.an ( 'array' ).and.have.length ( 18 );
                    expect ( csv[1] ).to.be.an ( 'array' ).and.have.length ( 18 );

                    csv_1 = csv;

                    Service
                        .readCsvSchemaFile( type )
                        .then( function ( result ) {

                            expect ( result ).to.be.an ( 'object' ).and.be.ok;
                            expect ( result ).to.have.property ( 'schema' ).and.be.ok;

                            var type = result.schema;

                            expect ( type ).to.be.a( 'object' ).and.be.ok;
                            expect ( type ).to.have.property ( 'name' ).and.be.ok;
                            expect ( type ).to.have.property ( 'description' ).and.be.ok;
                            expect ( type ).to.have.property ( 'service' ).and.be.ok;
                            expect ( type ).to.have.property ( 'method' ).and.be.ok;
                            expect ( type ).to.have.property ( 'fields' ).and.be.an( 'array' );

                            var obj = {
                                csv: csv,
                                schema: result.schema
                            };

                            Service
                                .guessHeadersByName( obj )
                                .then( function ( data ) {

                                    expect ( data ).to.be.an( 'array' ).and.have.length( 18 );
                                    expect ( data[0] ).to.be.an( 'object' ).and.be.ok;

                                    expect ( data[0] ).to.have.property ( 'value' ).and.equal ( csv[1][0] );
                                    expect ( data[0] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                                    expect ( data[0].possible ).to.have.deep.property ( '[0][0]', 0 );

                                    expect ( data[5] ).to.have.property ( 'value' ).and.equal ( csv[1][5] );
                                    expect ( data[5] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                                    expect ( data[5].possible ).to.have.deep.property ( '[0][0]', 5 );

                                    expect ( data[10] ).to.have.property ( 'value' ).and.equal ( csv[1][10] );
                                    expect ( data[10] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                                    expect ( data[10].possible ).to.have.deep.property ( '[0][0]', 10 );

                                    expect ( data[15] ).to.have.property ( 'value' ).and.equal ( csv[1][15] );
                                    expect ( data[15] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                                    expect ( data[15].possible ).to.have.deep.property ( '[0][0]', 15 );

                                    done();
                                }, done );
                        }, done );

                }, done );
        } );

    } );

    describe( '.handleExamineProcess( data )', function () {

        it( 'should be able to return preparing data', function ( done ) {

            var data = {
                type: 'exampleEmployee',
                url: config.urlToTestCsvFile,
                filename: 'myNewCsvFile',
                options: {}
            };

            expect( fs.existsSync ( [ config.pathToCsvSchemaFiles, data.type, '.json' ].join ( '' ) ) ).to.be.true;

            Service
                .handleExamineProcess( data )
                .then( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'columns' ).and.be.ok;
                    expect ( result ).to.have.property ( 'tmpCsvPath' ).and.be.ok;

                    expect ( result.tmpCsvPath ).to.contain( config.pathToCsvFiles );
                    expect ( result.tmpCsvPath ).to.contain( data.filename );
                    expect ( result.tmpCsvPath ).to.contain( '.csv' );

                    expect( fs.existsSync ( result.tmpCsvPath ) ).to.be.true;

                    expect ( result.columns ).to.be.an( 'array' ).and.have.length( 18 );
                    expect ( result.columns[0] ).to.be.an( 'object' ).and.be.ok;

                    expect ( result.columns[0] ).to.have.property ( 'value' ).and.equal ( csv_1[1][0] );
                    expect ( result.columns[0] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                    expect ( result.columns[0].possible ).to.have.deep.property ( '[0][0]', 0 );

                    expect ( result.columns[5] ).to.have.property ( 'value' ).and.equal ( csv_1[1][5] );
                    expect ( result.columns[5] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                    expect ( result.columns[5].possible ).to.have.deep.property ( '[0][0]', 5 );

                    expect ( result.columns[10] ).to.have.property ( 'value' ).and.equal ( csv_1[1][10] );
                    expect ( result.columns[10] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                    expect ( result.columns[10].possible ).to.have.deep.property ( '[0][0]', 10 );

                    expect ( result.columns[15] ).to.have.property ( 'value' ).and.equal ( csv_1[1][15] );
                    expect ( result.columns[15] ).to.have.property ( 'possible' ).and.be.an( 'array' );
                    expect ( result.columns[15].possible ).to.have.deep.property ( '[0][0]', 15 );


                    done();
                }, done );
        } );

        it( 'should be able get error if directory for save csv file do not exist', function ( done ) {

            var old_path = config.pathToCsvFiles;

            config.pathToCsvFiles = old_path + 'asasasasa/';

            var data = {
                type: 'exampleEmployee',
                url: config.urlToTestCsvFile,
                filename: 'myNewCsvFile_',
                options: {}
            };

            expect( old_path ).to.not.equal ( config.pathToCsvFiles );
            expect( fs.existsSync ( config.pathToCsvFiles ) ).to.be.false;

            Service
                .handleExamineProcess( data )
                .then( done )
                .fail ( function( err ) {

                    expect ( err ).to.be.a( 'string' ).and.have.length.above( 0 );

                    config.pathToCsvFiles = old_path;

                    done();
                });

        } );

        it( 'should be able get error if schema file do not exist', function ( done ) {

            var data = {
                type: 'notExistingSchema',
                url: config.urlToTestCsvFile,
                filename: 'myNewCsvFile_',
                options: {}
            };

            Service
                .handleExamineProcess( data )
                .then( done )
                .fail ( function( err ) {

                expect ( err ).to.be.a( 'string' ).and.have.length.above( 0 );

                done();
            });

        } );

    } );

    describe( '.reorganizeDataByColumns( data )', function () {

        it( 'should be able to reorganize data', function ( done ) {

            var data = {
                    type: 'exampleEmployee',
                    url: config.urlToTestCsvFile,
                    filename: 'myNewCsvFile',
                    options: {}
                }
              , pathToTestFile = [ config.pathToTestCsvFiles, 'examplePersonal.csv' ].join( '' );

            var schema, csv;

            expect( fs.existsSync ( [ config.pathToCsvSchemaFiles, data.type, '.json' ].join ( '' ) ) ).to.be.true;
            expect( fs.existsSync ( pathToTestFile ) ).to.be.true;

            Service
                .readCsvSchemaFile ( data.type )
                .then ( function( res ) {
                    schema = res.schema;
                    return Service.uploadFromFile ( pathToTestFile )
                })
                .then ( function( res ) {
                    csv = res;
                    return Service.guessHeadersByName ( { csv: csv, schema: schema } )
                })
                .then( function ( result ) {
                    var columns = [];

                    //choose the default indexes most probable headers
                    result
                        .forEach( function( col ) {
                            columns.push ( col.possible[0][0] )
                        });

                    var data = {
                        columns: columns,
                        schema: schema,
                        csv: csv
                    };

                    Service
                        .reorganizeDataByColumns( data )
                        .then( function ( reorgData ) {

                            expect( reorgData ).to.be.an( 'object' ).and.be.ok;
                            expect( reorgData ).to.have.property ( 'columns' ).and.be.ok;
                            expect( reorgData ).to.have.property ( 'data' ).and.be.ok;

                            var columns = reorgData.columns;

                            expect ( columns ).to.be.an ( 'array' ).and.have.length ( 18 );
                            expect ( columns[0] ).to.be.an ( 'object' ).and.be.ok;
                            expect ( columns[0] ).to.have.property ( 'titleReadable' ).and.be.ok;
                            expect ( columns[0] ).to.have.property ( 'title' ).and.be.ok;
                            expect ( columns[0] ).to.have.property ( 'type' ).and.be.ok;

                            var data = reorgData.data;

                            expect ( data ).to.be.an ( 'array' ).and.have.length.above ( 0 );
                            expect ( data[0] ).to.be.an ( 'object' ).and.be.ok;
                            expect ( data[0] ).to.have.property ( 'firstName' ).and.be.ok;
                            expect ( data[0] ).to.have.property ( 'lastName' ).and.be.ok;
                            expect ( data[0] ).to.have.property ( 'fullName' ).and.be.ok;
                            expect ( data[0] ).to.have.property ( 'cellPhone' ).and.be.ok;
                            expect ( data[0] ).to.have.property ( 'notes' ).and.be.ok;
                            expect ( data[0] ).to.have.property ( 'secondaryLanguage' ).and.be.ok;

                            done();
                        }, done );
                }, done );
        } );

    } );

    describe( '.handleSubmitDraftProcess( data )', function () {

        it( 'should be able to return reorganized data', function ( done ) {
            // -1: data that will not be included in the result
            var data = {
                columns: [ 0, 1, 2, -1, 4, 5, 6, 7, 8, 9, -1, 11, 12, 13, 14, 15, 16, -1 ],
                path: [ config.pathToTestCsvFiles, 'examplePersonal.csv' ].join( '' ),
                type: 'exampleEmployee'
            };

            expect( fs.existsSync ( data.path ) ).to.be.true;

            Service
                .handleSubmitDraftProcess ( data )
                .then ( function ( result ) {

                    expect ( result ).to.be.an ( 'object' ).and.be.ok;
                    expect ( result ).to.have.property ( 'columns' ).and.be.ok;
                    expect ( result ).to.have.property ( 'data' ).and.be.ok;

                    var columns = result.columns;

                    expect ( columns ).to.be.an ( 'array' ).and.have.length ( 15 );
                    expect ( columns[0] ).to.be.an ( 'object' ).and.be.ok;
                    expect ( columns[0] ).to.have.property ( 'titleReadable' ).and.be.ok;
                    expect ( columns[0] ).to.have.property ( 'title' ).and.be.ok;
                    expect ( columns[0] ).to.have.property ( 'type' ).and.be.ok;

                    var data = result.data;

                    expect ( data ).to.be.an ( 'array' ).and.have.length.above ( 0 );
                    expect ( data[0] ).to.be.an ( 'object' ).and.be.ok;
                    expect ( data[0] ).to.have.property ( 'firstName' ).and.be.ok;
                    expect ( data[0] ).to.have.property ( 'lastName' ).and.be.ok;
                    expect ( data[0] ).to.have.property ( 'fullName' ).and.be.ok;
                    expect ( data[0] ).to.have.property ( 'cellPhone' ).and.be.ok;
                    expect ( data[0] ).to.have.property ( 'notes' ).and.be.ok;

                    expect ( data[0] ).to.not.have.property ( 'Name' );
                    expect ( data[0] ).to.not.have.property ( 'Skype ID' );
                    expect ( data[0] ).to.not.have.property ( 'secondaryLanguage' );

                    done ();
                }, done );
        } );

    } );

    describe( '.handleSubmitFinalProcess( data )', function () {

        it( 'should be able to return error if servece do not exist', function ( done ) {
            // -1: data that will not be included in the result
            var data = {
                columns: [ 0, 1, 2, -1, 4, 5, 6, 7, 8, 9, -1, 11, 12, 13, 14, 15, 16, -1 ],
                path: [ config.pathToTestCsvFiles, 'examplePersonal.csv' ].join( '' ),
                type: 'exampleEmployee'
            };

            expect( fs.existsSync ( data.path ) ).to.be.true;

            Service
                .handleSubmitFinalProcess ( data )
                .then ( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 500 );
                    expect( result ).to.have.property( 'message' ).and.be.ok;

                    done ();
                }, done );
        } );

    } );

} );