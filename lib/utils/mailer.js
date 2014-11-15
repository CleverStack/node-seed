var Promise     = require( 'bluebird' )
  , config      = require( 'config' )
  , sendgrid;

module.exports  = {
    send: function( payload ) {
        if ( !sendgrid ) {
            sendgrid = require( 'sendgrid' )( config.sendgrid.apiUser, config.sendgrid.apiKey );
        }
        
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
