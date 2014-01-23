module.exports = function ( config ) {

    var Q = require( 'q' )
      , _ = require( 'lodash' )
      , mandrill = require( 'mandrill-api/mandrill' )
      , defConf = config.default
      , confMandrill = config.systems.Mandrill
      , mandrill_client = new mandrill.Mandrill( confMandrill.apiKey );

    return {
        send: function ( email, body, type ) {
            var deferred = Q.defer();

            var message = this.createMessage( email, body, type )
              , async = confMandrill.async;

            mandrill_client
                .messages
                .send( { "message": message, "async": async }, function ( result ) {

                    deferred.resolve( _.map( result, function( x ) { return { status: x.status, id: x._id }; }) );

                }, function ( err ) {

                    console.log( 'A mandrill error occurred: ' + err.name + ' - ' + err.message );

                    deferred.reject( err );

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
                to: [ { email: email.dump.toMail, type: 'to' } ],
                subject: email.subject || defConf.subject,
                from_email: fromMail,
                from_name: fromName,
                emailId: email.id
            };

            if ( config.text && type === "text" ){
                message.text = body;
            } else {
                message.html = body;
            }

            if ( config.cc && email.dump.usersCC && email.dump.usersCC.length ) {
                email.dump.usersCC.forEach( function ( userEmail ) {
                    message.to.push( { email: userEmail, type: 'cc' } );
                } );
            }

            if ( config.bcc && email.dump.usersBCC && email.dump.usersBCC.length ) {
                email.dump.usersBCC.forEach( function ( userEmail ) {
                    message.to.push( { email: userEmail, type: 'bcc' } );
                } );
            }

            return message;
        }
    };
};