var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , UserGithubService = null;

module.exports = function ( sequelize,
                            ORMUserGithubModel ) {

    if ( UserGithubService && UserGithubService.instance ) {
        return UserGithubService.instance;
    }

    var UserService = null;

    UserGithubService = require( 'services' ).BaseService.extend( {

        formatData: function ( profile, accessToken ) {
            var name = !!profile._json.name ? profile._json.name.split( ' ' ) : [];
            return {
                githubid: profile._json.id,
                username: profile._json.login,
                firstname: !!name.length ? name[ 0 ] : null,
                lastname: !!name.length && name.length > 1 ? name[ name.length - 1 ] : null,
                email: profile._json.email,
                picture: profile._json.avatar_url || null,
                link: profile._json.html_url,
                locale: profile._json.location || null,
                token: accessToken || null
            }
        }, //tested

        findOrCreate: function ( profile, accessToken ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile, accessToken );

            ORMUserGithubModel
                .find ( { where: { email: data.email } } )
                .success ( function ( gUser ) {

                    if ( !gUser ) {

                        data.accessedAt = moment.utc ().format ( 'YYYY-MM-DD HH:ss:mm' );

                        ORMUserGithubModel
                            .create ( data )
                            .success ( deferred.resolve )
                            .error ( deferred.reject );

                    } else {

                        gUser
                            .updateAttributes ( { accessedAt: moment.utc ().format ( 'YYYY-MM-DD HH:ss:mm' ), token: data.token } )
                            .success ( deferred.resolve )
                            .error ( deferred.reject );
                    }
                } )
                .error ( deferred.reject );

            return deferred.promise;
        }, //tested

        authenticate: function( gUser, profile ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile );

            try {
                UserService = injector.getInstance( 'UserService' );
            } catch ( err ) {
                console.log( err );
            }

            if ( !!gUser && !!UserService ) {

                if ( gUser.UserId ) {

                    UserService
                        .find( { where: { id: gUser.UserId, email: gUser.email } } )
                        .then( function( users ) {

                            var user = !!users && !!users.length
                                ? users[0]
                                : { statuscode: 403, message: 'invalid' };

                            deferred.resolve( user );
                        })
                        .fail( deferred.reject );

                } else {

                    UserService
                        .find( { where: { email: gUser.email } } )
                        .then( function( user ) {

                            user = user[0];

                            if ( !!user && !!user.id ) {

                                gUser
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

                                        gUser
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
                deferred.resolve( gUser );
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

            ORMUserGithubModel
                .findAll( { where: { deletedAt: null } } )
                .success( function( gUsers ) {
                    if ( !!gUsers && !!gUsers.length ) {
                        deferred.resolve( gUsers.map( function( u ) { return u.toJSON(); } ) );
                    } else {
                        deferred.resolve( {} );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        findUserById: function( gUserId ) {
            var deferred = Q.defer();

            ORMUserGithubModel
                .find( gUserId )
                .success( function( gUser ) {

                    if ( !!gUser && !!gUser.id ){
                        deferred.resolve( gUser.toJSON() );
                    } else {
                        deferred.resolve( { statuscode: 403, message: 'user do not exist' } );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, //tested

        deleteUser: function( gUserId ) {
            var deferred = Q.defer();

            ORMUserGithubModel
                .find( gUserId )
                .success( function( gUser ) {

                    if ( !!gUser && !!gUser.id ) {

                        gUser
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

    UserGithubService.instance = new UserGithubService( sequelize );
    UserGithubService.Model = ORMUserGithubModel;

    return UserGithubService.instance;
};