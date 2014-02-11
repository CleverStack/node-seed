var Q = require( 'q' )
  , crypto = require( 'crypto' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , UserDropboxService = null;

module.exports = function ( sequelize,
                            ORMUserDropboxModel ) {

    if ( UserDropboxService && UserDropboxService.instance ) {
        return UserDropboxService.instance;
    }

    var UserService = null;

    UserDropboxService = require( 'services' ).BaseService.extend( {

        formatData: function ( profile, accessToken ) {
            var name = !!profile._json.display_name ? profile._json.display_name.split( ' ' ) : [];
            return {
                dropboxid: profile._json.uid,
                email: profile._json.email,
                firstname: !!name.length ? name[ 0 ] : null,
                lastname: !!name.length && name.length > 1 ? name[ name.length - 1 ] : null,
                link: profile._json.referral_link,
                locale: profile._json.country || null,
                token: accessToken || null
            }
        }, //tested

        findOrCreate: function ( profile, accessToken ) {
            var deferred = Q.defer()
              , data = this.formatData ( profile, accessToken );

            if ( !!data.email ) {

                ORMUserDropboxModel
                    .find( { where: { email: data.email } } )
                    .success( function ( dbUser ) {

                        if ( !dbUser ) {

                            data.accessedAt = moment.utc().format( 'YYYY-MM-DD HH:ss:mm' );

                            ORMUserDropboxModel
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
        }, //tested

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

            ORMUserDropboxModel
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
        }, //tested

        findUserById: function( dbUserId ) {
            var deferred = Q.defer();

            ORMUserDropboxModel
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
        }, //tested

        deleteUser: function( dbUserId ) {
            var deferred = Q.defer();

            ORMUserDropboxModel
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
        } //tested

    } );

    UserDropboxService.instance = new UserDropboxService( sequelize );
    UserDropboxService.Model = ORMUserDropboxModel;

    return UserDropboxService.instance;
};