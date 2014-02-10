var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , UserFacebookService = null;

module.exports = function ( sequelize,
                            ORMUserFacebookModel ) {

    if ( UserFacebookService && UserFacebookService.instance ) {
        return UserFacebookService.instance;
    }

    var UserService = null;

    UserFacebookService = require( 'services' ).BaseService.extend( {

        formatData: function ( profile, accessToken ) {
            var name = !!profile._json.name ? profile._json.name.split( ' ' ) : [];
            return {
                facebookid: profile._json.id,
                username: profile._json.username,
                firstname: profile._json.first_name,
                lastname: profile._json.last_name,
                email: profile._json.email,
                picture: !!profile._json.picture
                    ? typeof profile._json.picture == 'object' && profile._json.picture.data
                        ? profile._json.picture.data.url
                        : profile._json.picture
                    : null,
                link: profile._json.link,
                locale: profile._json.locale || null,
                token: accessToken || null
            }
        },

        findOrCreate: function ( profile, accessToken ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile, accessToken );

            if ( data.email ) {
                
                ORMUserFacebookModel
                    .find ( { where: { email: data.email } } )
                    .success ( function ( fbUser ) {

                        if ( !fbUser ) {
    
                            data.accessedAt = moment.utc ().format ( 'YYYY-MM-DD HH:ss:mm' );
    
                            ORMUserFacebookModel
                                .create ( data )
                                .success ( deferred.resolve )
                                .error ( deferred.reject );
    
                        } else {
    
                            fbUser
                                .updateAttributes ( { accessedAt: moment.utc ().format ( 'YYYY-MM-DD HH:ss:mm' ), token: data.token } )
                                .success ( deferred.resolve )
                                .error ( deferred.reject );
                        }
                    } )
                    .error ( deferred.reject );
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }, //tested

        authenticate: function( fbUser, profile ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile );

            try {
                UserService = injector.getInstance( 'UserService' );
            } catch ( err ) {
                console.log( err );
            }

            if ( !!fbUser && !!UserService ) {

                if ( fbUser.UserId ) {

                    UserService
                        .find( { where: { id: fbUser.UserId, email: fbUser.email } } )
                        .then( function( users ) {

                            var user = !!users && !!users.length
                                ? users[0]
                                : { statuscode: 403, message: 'invalid' };

                            deferred.resolve( user );
                        })
                        .fail( deferred.reject );

                } else {

                    UserService
                        .find( { where: { email: fbUser.email } } )
                        .then( function( user ) {

                            user = user[0];

                            if ( !!user && !!user.id ) {

                                fbUser
                                    .updateAttributes( { UserId: user.id } )
                                    .success ( function () {
                                        deferred.resolve ( user );
                                    } )
                                    .error( deferred.reject );

                            } else {

                                data.confirmed = true;
                                data.username = data.email;
                                data.password = crypto.createHash( 'sha1' ).update( Math.floor(Math.random() * 1e18) + '' ).digest( 'hex' )

                                UserService
                                    .create( data )
                                    .then( function( user ) {

                                        fbUser
                                            .updateAttributes ( { UserId: user.id } )
                                            .success ( function () {
                                                deferred.resolve ( user );
                                            } )
                                            .error ( deferred.reject );
                                    })
                                    .fail( deferred.reject );
                            }
                        })
                        .fail( deferred.reject );
                }

            } else {
                deferred.resolve( fbUser );
            }

            return deferred.promise;
        }, //tested

        updateAccessedDate: function( user ){
            var deferred = Q.defer();

            if ( !!user && !!user.id ) {
                user
                    .updateAttributes( { accessedAt: moment.utc().format( 'YYYY-MM-DD HH:ss:mm' ) } )
                    .success( function() {
                        deferred.resolve( user.toJSON() );
                    })
                    .error( deferred.reject );
            } else {
                deferred.resolve( user );
            }

            return deferred.promise;
        }, //tested

        listUsers: function() {
            var deferred = Q.defer();

            ORMUserFacebookModel
                .findAll( { where: { deletedAt: null } } )
                .success( function( fbUsers ) {
                    if ( !!fbUsers && !!fbUsers.length ) {
                        deferred.resolve( fbUsers.map( function( u ) { return u.toJSON(); } ) );
                    } else {
                        deferred.resolve( {} );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        findUserById: function( fbUserId ) {
            var deferred = Q.defer();

            ORMUserFacebookModel
                .find( fbUserId )
                .success( function( fbUser ) {

                    if ( !!fbUser && !!fbUser.id ){
                        deferred.resolve( fbUser.toJSON() );
                    } else {
                        deferred.resolve( { statuscode: 403, message: 'user do not exist' } );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        deleteUser: function( fbUserId ) {
            var deferred = Q.defer();

            ORMUserFacebookModel
                .find( fbUserId )
                .success( function( fbUser ) {

                    if ( !!fbUser && !!fbUser.id ) {

                        fbUser
                            .destroy()
                            .success( function( result ) {

                                if ( !result.deletedAt ) {
                                    deferred.resolve( { statuscode: 500, message: 'error' } );
                                } else {
                                    deferred.resolve( { statuscode: 200, message: 'user is deleted' } );
                                }

                            })
                            .error( deferred.reject );

                    } else {
                        deferred.resolve( { statuscode: 403, message: 'user do not exist' } )
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        } //tested

    } );

    UserFacebookService.instance = new UserFacebookService( sequelize );
    UserFacebookService.Model = ORMUserFacebookModel;

    return UserFacebookService.instance;
};