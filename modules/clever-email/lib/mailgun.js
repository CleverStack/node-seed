module.exports = function ( config ) {

    var Q = require( 'q' )
      , defConf = config.default
      , confMailgun = config.systems.MailGun
      , mailgun = require( 'mailgun-js' )( confMailgun.apiKey, confMailgun.domain );

    return {
        send: function ( email, html, text ) {
            var deferred = Q.defer();

            var message = this.createMessage( email, html, text );

            mailgun
                .messages
                .send( message, function ( err, response, body ) {

                    if ( err ) {
                        console.log( "MailGun Error: ", err.toString() );
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
                from: [ fromName, ' <', fromMail, '>' ].join( '' ),
                to: [ '<', email.dump.toMail, '>' ].join( '' ),
                subject: email.subject || defConf.subject,
                emailId: email.id
            };

            if ( config.text && !!text ){
                message.text = text;
            } else {
                message.html = html;
            }

            if ( config.cc && email.dump.usersCC && email.dump.usersCC.length ) {
                var cc = [];
                email.dump.usersCC.forEach( function ( userEmail ) {
                    cc.push( [ '<', userEmail, '>' ].join( '' ) );
                } );
                message.cc = cc.join( ', ' )
            }

            if ( config.bcc && email.dump.usersBCC && email.dump.usersBCC.length ) {
                var bcc = [];
                email.dump.usersBCC.forEach( function ( userEmail ) {
                    bcc.push( [ '<', userEmail, '>' ].join( '' ) );
                } );
                message.bcc = bcc.join( ', ' )
            }

            return message;
        }
    };
};