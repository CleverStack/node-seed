var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , UserLinkedinService = null;

module.exports = function ( sequelize,
                            ORMUserLinkedinModel ) {

    if ( UserLinkedinService && UserLinkedinService.instance ) {
        return UserLinkedinService.instance;
    }

    var UserService = null;

    UserLinkedinService = require( 'services' ).BaseService.extend( {

        formatData: function ( profile, accessToken ) {
            return {
                linkedinid: profile._json.id,
                email: profile._json.emailAddress,
                firstname: profile._json.firstName,
                lastname: profile._json.lastName,
                link: profile._json.publicProfileUrl,
                picture: profile._json.pictureUrl || null,
                locale: !!profile._json.location && typeof profile._json.location == 'object'
                    ? profile._json.location.name
                    : null,
                token: accessToken || null
            }
        }, 

        findOrCreate: function ( profile, accessToken ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile, accessToken );

            if ( !!data.email ) {

                ORMUserLinkedinModel
                    .find( { where: { email: data.email } } )
                    .success( function ( dbUser ) {

                        if ( !dbUser ) {

                            data.accessedAt = moment.utc().format( 'YYYY-MM-DD HH:ss:mm' );

                            ORMUserLinkedinModel
                                .create( data )
                                .success( deferred.resolve )
                                .error( deferred.reject );

                        } else {

                            dbUser
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
        }, 

        authenticate: function( dbUser, profile ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile );

            try {
                UserService = injector.getInstance( 'UserService' );
            } catch ( err ) {
                console.log( err );
            }

            if ( !!dbUser && !!UserService ) {

                if ( dbUser.UserId ) {

                    UserService
                        .find( { where: { id: dbUser.UserId, email: dbUser.email } } )
                        .then( function( users ) {

                            var user = !!users && !!users.length
                                ? users[0]
                                : { statuscode: 403, message: 'invalid' };

                            deferred.resolve( user );
                        })
                        .fail( deferred.reject );

                } else {

                    UserService
                        .find( { where: { email: dbUser.email } } )
                        .then( function( user ) {

                            user = user[0];

                            if ( !!user && !!user.id ) {

                                dbUser
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

                                        dbUser
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
                deferred.resolve( dbUser );
            }

            return deferred.promise;
        }, 

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
        }, 

        listUsers: function() {
            var deferred = Q.defer();

            ORMUserLinkedinModel
                .findAll( { where: { deletedAt: null } } )
                .success( function( dbUsers ) {
                    if ( !!dbUsers && !!dbUsers.length ) {
                        deferred.resolve( dbUsers.map( function( u ) { return u.toJSON(); } ) );
                    } else {
                        deferred.resolve( {} );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, 

        findUserById: function( dbUserId ) {
            var deferred = Q.defer();

            ORMUserLinkedinModel
                .find( dbUserId )
                .success( function( dbUser ) {

                    if ( !!dbUser && !!dbUser.id ){
                        deferred.resolve( dbUser.toJSON() );
                    } else {
                        deferred.resolve( { statuscode: 403, message: 'user do not exist' } );
                    }
                })
                .error( deferred.reject );

            return deferred.promise;
        }, 

        deleteUser: function( dbUserId ) {
            var deferred = Q.defer();

            ORMUserLinkedinModel
                .find( dbUserId )
                .success( function( dbUser ) {

                    if ( !!dbUser && !!dbUser.id ) {

                        dbUser
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
        } 

    } );

    UserLinkedinService.instance = new UserLinkedinService( sequelize );
    UserLinkedinService.Model = ORMUserLinkedinModel;

    return UserLinkedinService.instance;
};