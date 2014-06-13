var Q     = require( 'q' )
  , spawn = require( 'child_process' ).spawn
  , path  = require( 'path' );

function installORM () {
    var defered = Q.defer()
      , objs = [
            { reg: /Database username/ , write: 'travis\n'   , done: false },
            { reg: /Database password/ , write: '\n'         , done: false },
            { reg: /Database name/     , write: 'test_db\n'  , done: false },
            { reg: /Database dialect/  , write: '\n'         , done: false },
            { reg: /Database port/     , write: '3306\n'     , done: false },
            { reg: /Database host/     , write: '127.0.0.1\n', done: false },
        ]
      , proc = spawn ( 'clever', [ 'install', 'clever-orm' ], { cwd: path.resolve( path.join( __dirname, '..' ) ) } );

    console.log( 'step #1 - install clever-orm module - begin\n' );

    proc.stdout.on('data', function (data) {
        var str = data.toString();

        if ( str.match( /ing/ ) !== null ) {
            console.log( str )
        } 

        objs.forEach ( function ( obj, i ) {
            if ( obj.done !== true && str.match( obj.reg ) !== null ) {
                objs[i].done = true;
                proc.stdin.write( obj.write );
            } 
        });
    });

    proc.stderr.on('data', function (data) {
        console.log( 'Error in step #1 - ' + data.toString() + '\n');
        defered.reject ( data.toString() );
    });

    proc.on('close', function (code) {
        console.log('step #1 process exited with code ' + code + '\n' );
        defered.resolve();
    });

    return defered.promise;
}

installORM()
    .fail( function (err) {
        console.log('Error - ' + err );
    });