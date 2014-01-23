module.exports = function ( config ) {

    var mandrill = require( './mandrill' )
      , sendgrid = require( './sendgrid' )
      , mailgun = require( './mailgun' )
      , confs = config.systems;

    var mailer = confs.Mandrill.isActive
        ? mandrill
        : confs.SendGrid.isActive
            ? sendgrid
            : confs.MailGun.isActive
                ? mailgun
                : mandrill;

    return mailer( config );
};