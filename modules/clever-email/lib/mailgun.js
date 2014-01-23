module.exports = function ( config ) {

    var Q = require( 'q' )
      , _ = require( 'lodash' )
      , defConf = config.default
      , confMailgun = config.systems.MailGun
      , mailgun = require( 'mailgun-js' )( confMailgun.apiKey, confMailgun.domain );

    return {
        send: function ( email, body, type ) {
            var deferred = Q.defer();

            var message = this.createMessage( email, body, type );

            mailgun
                .messages
                .send( message, function ( err, res, body ) {

                    if ( err ) {
                        console.log( "MailGun Error: ", err.toString() );
                        deferred.reject( err );
                        return;
                    }

                    deferred.resolve( _.map( res, function( x ) { return { status: x.message, id: x.id }; }) );
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
                from: [ fromName, ' <', fromMail, '>' ].join( '' ),
                to: [ '<', email.dump.toMail, '>' ].join( '' ),
                subject: email.subject || defConf.subject,
                emailId: email.id
            };

            if ( config.text && type === "text" ){
                message.text = body;
            } else {
                message.html = body;
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