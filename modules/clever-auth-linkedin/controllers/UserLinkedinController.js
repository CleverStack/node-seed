var config = require ( 'config' )[ 'clever-auth-linkedin' ]
  , passport = require ( 'passport' )
  , qs = require ( 'qs' )
  , LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

var state = +new Date() + ''
  , scope = [ 'r_emailaddress', 'r_basicprofile' ];

module.exports = function ( UserLinkedinService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new LinkedInStrategy(
        {
            clientID: config.linkedin.AppKey,
            clientSecret: config.linkedin.AppSecret,
            callbackURL: config.linkedin.redirectURIs,
            state: state,
            scope: scope
        },
        function ( accessToken, refreshToken, profile, done ) {

            UserLinkedinService
                .findOrCreate( profile, accessToken )
                .then( function( gUser ) {
                    return UserLinkedinService.authenticate ( gUser, profile )
                })
                .then( UserLinkedinService.updateAccessedDate )
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend (
        {
            service: UserLinkedinService
        },
        {
            listAction: function () {
                UserLinkedinService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, 

            getAction: function () {
                var guId = this.req.params.id;

                UserLinkedinService
                    .findUserById( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, 

            deleteAction: function () {
                var guId = this.req.params.id;

                UserLinkedinService.deleteUser( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, 

            loginAction: function () {
                var params = {
                    response_type: "code",
                    client_id: config.linkedin.AppKey,
                    redirect_uri: config.linkedin.redirectURIs,
                    state: state,
                    scope: scope
                };

                this.send( { url: 'https://www.linkedin.com/uas/oauth2/authorization?' + qs.stringify( params ) }, 200 );

            }, 

            returnAction: function () {
                passport.authenticate( 'linkedin', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
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
                console.log(user)
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