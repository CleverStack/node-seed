var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , UserGoogleService = null;

module.exports = function ( sequelize,
                            ORMUserGoogleModel ) {

    if ( UserGoogleService && UserGoogleService.instance ) {
        return UserGoogleService.instance;
    }

    var UserService = null;

    UserGoogleService = require( 'services' ).BaseService.extend( {

        formatData: function ( profile, accessToken ) {
            return {
                googleid: profile._json.id,
                email: profile._json.email,
                firstname: profile._json.given_name,
                lastname: profile._json.family_name,
                picture: profile._json.picture || null,
                verified: profile._json.verified_email,
                link: profile._json.link,
                gender: profile._json.gender,
                locale: profile._json.locale,
                token: accessToken || null
            }
        }, //tested

        findOrCreate: function ( profile, accessToken ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile, accessToken );

            if ( data.verified ) {

                ORMUserGoogleModel
                    .find( { where: { email: data.email } } )
                    .success( function ( gUser ) {

                        if ( !gUser ) {

                            data.accessedAt = moment.utc().format( 'YYYY-MM-DD HH:ss:mm' );

                            ORMUserGoogleModel
                                .create( data )
                                .success( deferred.resolve )
                                .error( deferred.reject );

                        } else {

                            gUser
                                .updateAttributes( { accessedAt: moment.utc().format( 'YYYY-MM-DD HH:ss:mm' ), token: data.token } )
                                .success( deferred.resolve )
                                .error( deferred.reject );
                        }
                    } )
                    .error( deferred.reject );
            } else {
                deferred.resolve();
            }

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

            ORMUserGoogleModel
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

            ORMUserGoogleModel
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

            ORMUserGoogleModel
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

    UserGoogleService.instance = new UserGoogleService( sequelize );
    UserGoogleService.Model = ORMUserGoogleModel;

    return UserGoogleService.instance;
};