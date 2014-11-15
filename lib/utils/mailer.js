var Promise     = require( 'bluebird' )
  , config      = require( 'config' )
  , sendgrid    = require( 'sendgrid' )( config.sendgrid.apiUser, config.sendgrid.apiKey );

module.exports  = { 
    send: function( payload ) {
        return new Promise( function( resolve, reject ) {
            sendgrid.send( payload, function( err, res ) {
                if ( !err ) {
                    resolve( res );
                } else {
                    reject( new Error( err ) );
                }
            });
        });
    }
}
