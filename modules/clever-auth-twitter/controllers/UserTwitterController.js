var config = require ( 'config' )[ 'clever-auth-twitter' ]
  , passport = require ( 'passport' )
  , qs = require ( 'qs' )
  , request = require ( 'request' )
  , TwitterStrategy = require('passport-twitter').Strategy;

var token;

module.exports = function ( UserTwitterService ) {

    passport.serializeUser( function ( user, done ) {
        done( null, user );
    } );

    passport.deserializeUser( function ( user, done ) {
        done( null, user )
    } );

    passport.use( new TwitterStrategy(
        {
            consumerKey: config.twitter.APIKey,
            consumerSecret: config.twitter.APISecret,
            callbackURL: config.twitter.redirectURIs
        },
        function ( token, tokenSecret, profile, done ) {
console.log(profile)
            UserTwitterService
                .findOrCreate( profile, accessToken )
                .then( function( gUser ) {
                    return UserTwitterService.authenticate ( gUser, profile )
                })
                .then( UserTwitterService.updateAccessedDate )
                .then( done.bind( null, null ) )
                .fail( done );
        }
    ));


    return (require( 'classes' ).Controller).extend (
        {
            service: UserTwitterService
        },
        {
            listAction: function () {
                UserTwitterService.listUsers()
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            getAction: function () {
                var guId = this.req.params.id;

                UserTwitterService
                    .findUserById( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            deleteAction: function () {
                var guId = this.req.params.id;

                UserTwitterService.deleteUser( guId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            }, //tested

            loginAction: function () {
                var self = this

                var params = {
                        callback: config.twitter.redirectURIs,
                        consumer_key: config.twitter.APIKey,
                        consumer_secret: config.twitter.APISecret
                    }
                  , url = 'https://api.twitter.com/oauth/request_token';

                request.post ( { url: url, oauth: params }, function ( err, req, body ) {

                    token = qs.parse( body )
                    var url = 'https://api.twitter.com/oauth/authenticate?';

                    var params = {
                        oauth_token: token.oauth_token
                    };

                    self.send( { url: url + qs.stringify( params ) }, 200 );

                    })
//                })

            }, //tested

            returnAction: function () {

                passport.authenticate( 'twitter', this.proxy( 'handleLocalUser' ) )( this.req, this.res, this.next );

//
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