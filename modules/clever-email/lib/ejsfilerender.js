var path = require( 'path' )
  , Q = require( 'q' )
  , ejs = require( 'ejs' )
    , approot = path.resolve( __dirname + '../../../' );

module.exports = function ( tpls ) {

    return function ( prop, data ) {
        var deferred = Q.defer();

        ejs.renderFile( approot + '/' + tpls[ prop ], data, function ( err, html ) {

            if ( err ) {
                deferred.reject( err );
                return;
            }

            deferred.resolve( html );

        } );

        return  deferred.promise;
    }

};