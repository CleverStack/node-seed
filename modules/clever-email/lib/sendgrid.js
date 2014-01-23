module.exports = function ( config ) {

    var Q = require( 'q' )
      , _ = require( 'lodash' )
      , defConf = config.default
      , confSendGrid = config.systems.SendGrid
      , sendgrid = require( 'sendgrid' )( confSendGrid.apiUser, confSendGrid.apiKey )
      , Email = sendgrid.Email;

    return {
        send: function ( email, body, type ) {
            var deferred = Q.defer()
              , message = this.createMessage( email, body, type )
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

        createMessage: function( email, body, type ){
            var fromMail = defConf.from
              , fromName = defConf.fromName;

            if ( email.dump.companyName ) {
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

            if ( config.text && type === "text" ){
                message.text = body;
            } else {
                message.html = body;
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