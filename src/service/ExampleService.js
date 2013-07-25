var BaseClass = require(__dirname + '/Base')
  , Q = require('q')
  , UserService = null
  , crypto = require( 'crypto' )
  , config = require( './../../config' );

module.exports = function( Db, UserModel ) {
    if (UserService && UserService.instance) {
        return UserService.instance;
    }

    UserService = BaseClass.extend({
        create: function (data) {
            var deferred = Q.defer();

            UserModel.create(data)
            .success(deferred.resolve)
            .error(deferred.reject);

            return deferred.promise;
        },

        update: function (user, data) {
            var deferred = Q.defer();

            user.updateAttributes(data)
            .success(deferred.resolve);
            .error(deferred.reject);

            return deferred.promise;
        },

        authenticate: function(credentials) {
            var deferred = Q.defer();

            UserModel.find({ where: credentials }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }
    });

    UserService.instance = new UserService(Db);
    UserService.Model = UserModel;

    return UserService.instance;
}