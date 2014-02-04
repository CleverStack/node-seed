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
                .authenticate( profile, accessToken )
                .then( function( gUser ) {
                    return UserGoogleService.associate ( gUser, profile )
                })
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend(
        {
            service: UserGoogleService
        },
        {
            listAction: function () {
                UserGoogleService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            deleteAction: function () {
                var uId = this.req.params.id;

                UserGoogleService.deleteUser( { id: uId } )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            loginAction: function () {
                var params = {
                    response_type: "code",
                    client_id: config.google.clientId,
                    redirect_uri: config.google.redirectURIs,
                    display: "popup",
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
                };

                this.send(200, { url: 'https://accounts.google.com/o/oauth2/auth?' + qs.stringify(params) } );

            },

            returnAction: function () {
                passport.authenticate( 'google', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
            },

            handleLocalUser: function ( err, user ) {
                if ( err ) return this.handleException( err );
                if ( !user ) return this.send( {}, 403 );
                this.loginUserJson( user );
            },

            loginUserJson: function ( user ) {
                this.req.login( user, this.proxy( 'handleLoginJson', user ) );
            },

            handleLoginJson: function ( user, err ) {
                if ( err ) return this.handleException( err );
                this.send( user, 200 );
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