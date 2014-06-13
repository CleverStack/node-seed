var Q = require( 'q' )
  , spawn = require( 'child_process' ).spawn
  , path  = require( 'path' )
  , fs    = require( 'fs' )
  , ncp   = require('ncp').ncp;

//install clever-orm module to test project
function installORM () {
    var defered = Q.defer()
      , proc = spawn ( 'clever', [ 'install', 'clever-orm' ], { cwd: path.resolve( path.join( __dirname, '..' ) ) } );

    console.log( 'step #2 - install clever-orm module - begin\n' );

    proc.stdout.on('data', function (data) {
        var str = data.toString()
          , objs = [
                { reg: /Database username/ , write: 'travis\n' },
                { reg: /Database password/ , write: '\n' },
                { reg: /Database name/     , write: 'test_db\n' },
                { reg: /Database dialect/  , write: '\n' },
                { reg: /Database port/     , write: '3306\n' },
                { reg: /Database host/     , write: '127.0.0.1\n' },
            ];

        if ( str.match( /ing/ ) !== null ) {
            console.log( str )
        } 

        objs.forEach ( function ( obj ) {
            if ( str.match( obj.reg ) !== null ) {
                proc.stdin.write( obj.write );
            } 
        });
    });

    proc.stderr.on('data', function (data) {
        console.log( 'Error in step #2 - ' + data.toString() + '\n');
        defered.reject ( data.toString() );
    });

    proc.on('close', function (code) {
        console.log('step #2 process exited with code ' + code + '\n' );
        defered.resolve();
    });

    return defered.promise;
}

//create and update config files
function configFiles() {
    var deferred = Q.defer()
      , comFile = path.join( __dirname, '..', 'config', 'test.json' )
      , comData = {
            "environmentName": "TEST",
            "memcacheHost": "127.0.0.1:11211",
            "clever-orm": {
                "db": {
                    "username": "travis",
                    "password": "",
                    "database": "test_db",
                    "options": {
                        "dialect": "mysql",
                        "host": "127.0.0.1",
                        "port": "3306"
                    }
                }
            }
        };

    console.log( 'step #1 - create and update config files - begin\n' );
    fs.writeFile ( comFile, JSON.stringify( comData, null, '  ' ), function ( err ) {

        if ( err ) {
            console.log( 'Error in step #1 - ' + err + '\n');
            return deferred.reject ( err );
        }

        console.log('step #1 process exited with code 0\n' );
        deferred.resolve();
    });

    return deferred.promise;    
}

configFiles()
    .then( installORM )
    .fail( function (err) {
        console.log('Error - ' + err );
    });