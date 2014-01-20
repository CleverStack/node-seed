module.exports = function ( config ) {
    var Q = require( 'q' )
      , sendgrid = require( 'sendgrid' )( config.apiUser, config.apiKey )
      , Email = sendgrid.Email;

    return function ( payload ) {
        var deferred = Q.defer()
          , email = new Email( payload );

        if ( payload.emailId ) {
            email.setUniqueArgs( { email_id: payload.emailId } );
        }

        sendgrid.send( email, function ( err, response ) {

            if ( err ) {
                console.log( "SendGrid Error:  \n", err.toString() );
                deferred.reject( err );
                return;
            }

            deferred.resolve( response );
        } );

        return deferred.promise;
    };
};