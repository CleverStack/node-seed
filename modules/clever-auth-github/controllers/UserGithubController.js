var config = require ( 'config' )[ 'clever-auth-github' ]
  , passport = require ( 'passport' )
  , qs = require ( 'qs' )
  , GitHubStrategy = require('passport-github').Strategy;

var state = +new Date() + '';

module.exports = function ( UserGithubService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new GitHubStrategy(
        {
            clientID: config.github.clientId,
            clientSecret: config.github.clientSecret,
            callbackURL: config.github.redirectURIs,
            state: state,
            scope: 'user'
        },
        function ( accessToken, refreshToken, profile, done ) {

            UserGithubService
                .findOrCreate( profile, accessToken )
                .then( function( gUser ) {
                    return UserGithubService.authenticate ( gUser, profile )
                })
                .then( UserGithubService.updateAccessedDate )
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend (
        {
            service: UserGithubService
        },
        {
            listAction: function () {
                UserGithubService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            getAction: function () {
                var guId = this.req.params.id;

                UserGithubService
                    .findUserById( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            deleteAction: function () {
                var guId = this.req.params.id;

                UserGithubService
                    .deleteUser( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            loginAction: function () {
                var params = {
                    client_id: config.github.clientId,
                    redirect_uri: config.github.redirectURIs,
                    scope: 'user',
                    state: state
                };

                this.send( { url: 'https://github.com/login/oauth/authorize?' + qs.stringify( params ) }, 200 );

            }, //tested

            returnAction: function () {
                passport.authenticate( 'github', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
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