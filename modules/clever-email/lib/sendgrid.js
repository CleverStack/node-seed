module.exports = function ( config ) {

    var Q = require( 'q' )
      , defConf = config.default
      , confSendGrid = config.systems.SendGrid
      , sendgrid = require( 'sendgrid' )( confSendGrid.apiUser, confSendGrid.apiKey )
      , Email = sendgrid.Email;

    return {
        send: function ( email, html, text ) {
            var deferred = Q.defer()
              , message = this.createMessage( email, html, text )
              , email = new Email( message );

            if ( message.emailId ) {
                email.setUniqueArgs( { email_id: message.emailId } );
            }

            sendgrid.send( email, function ( err, response ) {

                if ( err ) {
                    console.log( "SendGrid Error: ", err.toString() );
                    deferred.reject( err );
                    return;
                }

                deferred.resolve( response );
            } );

            return deferred.promise;
        },

        createMessage: function( email, html, text ){
            var fromMail = defConf.from
              , fromName = defConf.fromName;

            if ( email.dump.fromCompanyName ) {
                fromName = email.dump.fromName;
                fromMail = email.dump.fromMail;
            }

            var message = {
                to: [ email.dump.toMail ],
                subject: email.subject || defConf.subject,
                from: fromMail,
                fromname: fromName,
                emailId: emailId
            };

            if ( config.text && !!text ){
                message.text = text;
            } else {
                message.html = html;
            }

            if ( config.cc && email.dump.usersCC && email.dump.usersCC.length ) {
                email.dump.usersCC.forEach( function ( userEmail ) {
                    message.to.push( userEmail );
                } );
            }

            if ( config.bcc && email.dump.usersBCC && email.dump.usersBCC.length ) {
                message.bcc = email.dump.usersBCC;
            }

            return message;
        }
    }
};