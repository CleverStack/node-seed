var config = require ( 'config' )[ 'clever-auth-google' ]
  , passport = require ( 'passport' )
  , qs = require ( 'qs' )
  , GoogleStrategy = require ( 'passport-google-oauth' ).OAuth2Strategy;

module.exports = function ( UserGoogleService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.redirectURIs
        },
        function ( accessToken, refreshToken, profile, done ) {

            UserGoogleService
                .findOrCreate( profile, accessToken )
                .then( function( gUser ) {
                    return UserGoogleService.authenticate ( gUser, profile )
                })
                .then( UserGoogleService.updateAccessedDate )
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend (
        {
            service: UserGoogleService
        },
        {
            listAction: function () {
                UserGoogleService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            getAction: function () {
                var guId = this.req.params.id;

                UserGoogleService
                    .findUserById( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            deleteAction: function () {
                var guId = this.req.params.id;

                UserGoogleService.deleteUser( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            loginAction: function () {
                var params = {
                    response_type: "code",
                    client_id: config.google.clientId,
                    redirect_uri: config.google.redirectURIs,
                    display: "popup",
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
                };

                this.send( { url: 'https://accounts.google.com/o/oauth2/auth?' + qs.stringify( params ) }, 200 );

            }, //tested

            returnAction: function () {
                passport.authenticate( 'google', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
            },

            handleLocalUser: function ( err, user ) {
                if ( err ) return this.handleException( err );

                if ( !user ) {
                    this.res.statusCode = 302;
                    this.res.setHeader( 'body', {} );
                    this.res.setHeader( 'Location', config.frontendURL );
                    this.res.end();
                } else {
                    this.loginUserJson( user );
                }
            },

            loginUserJson: function ( user ) {
                this.req.login( user, this.proxy( 'handleLoginJson', user ) );
            },

            handleLoginJson: function ( user, err ) {
                if ( err ) return this.handleException( err );

                this.res.statusCode = 302;
                this.res.setHeader( 'body', user );
                this.res.setHeader( 'Location', config.frontendURL );
                this.res.end();
            },

            handleServiceMessage: function ( obj ) {

                if ( obj.statuscode ) {
                    this.send( obj.message, obj.statuscode );
                    return;
                }

                this.send( obj, 200 );
            }

        } );
};