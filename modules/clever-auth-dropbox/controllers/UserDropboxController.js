var config = require ( 'config' )[ 'clever-auth-dropbox' ]
  , passport = require ( 'passport' )
  , qs = require ( 'qs' )
  , DropboxOAuth2Strategy = require( 'passport-dropbox-oauth2' ).Strategy;

var state = +new Date() + '';

module.exports = function ( UserDropboxService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new DropboxOAuth2Strategy(
        {
            clientID: config.dropbox.AppKey,
            clientSecret: config.dropbox.AppSecret,
            callbackURL: config.dropbox.redirectURIs,
            state: state
        },
        function ( accessToken, refreshToken, profile, done ) {

            UserDropboxService
                .findOrCreate( profile, accessToken )
                .then( function( gUser ) {
                    return UserDropboxService.authenticate ( gUser, profile )
                })
                .then( UserDropboxService.updateAccessedDate )
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend (
        {
            service: UserDropboxService
        },
        {
            listAction: function () {
                UserDropboxService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, 

            getAction: function () {
                var guId = this.req.params.id;

                UserDropboxService
                    .findUserById( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, 

            deleteAction: function () {
                var guId = this.req.params.id;

                UserDropboxService.deleteUser( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, 

            loginAction: function () {
                var params = {
                    response_type: "code",
                    client_id: config.dropbox.AppKey,
                    redirect_uri: config.dropbox.redirectURIs,
                    state: state
                };

                this.send( { url: 'https://www.dropbox.com/1/oauth2/authorize?' + qs.stringify( params ) }, 200 );

            }, 

            returnAction: function () {
                passport.authenticate( 'dropbox-oauth2', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
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