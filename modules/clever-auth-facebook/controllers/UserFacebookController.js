var config = require ( 'config' )[ 'clever-auth-facebook' ]
  , passport = require ( 'passport' )
  , qs = require ( 'qs' )
  , FacebookStrategy = require('passport-facebook').Strategy;

var scope = 'email,user_about_me';

module.exports = function ( UserFacebookService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new FacebookStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.redirectURIs,
            scope: scope
        },
        function ( accessToken, refreshToken, profile, done ) {

            UserFacebookService
                .findOrCreate( profile, accessToken )
                .then( function( fbUser ) {
                    return UserFacebookService.authenticate ( fbUser, profile )
                })
                .then( UserFacebookService.updateAccessedDate )
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend (
        {
            service: UserFacebookService
        },
        {
            listAction: function () {
                UserFacebookService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            getAction: function () {
                var fbuId = this.req.params.id;

                UserFacebookService
                    .findUserById( fbuId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            deleteAction: function () {
                var fbuId = this.req.params.id;

                UserFacebookService
                    .deleteUser( fbuId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            loginAction: function () {
                var params = {
                    client_id: config.facebook.clientId,
                    redirect_uri: config.facebook.redirectURIs,
                    scope: scope
                };

                this.send( { url: 'https://www.facebook.com/dialog/oauth?' + qs.stringify( params ) }, 200 );

            }, //tested

            returnAction: function () {
                passport.authenticate( 'facebook', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );
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