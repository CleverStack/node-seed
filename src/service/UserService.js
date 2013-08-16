var BaseService = require('./BaseService')
  , Q = require('q')
  , UserService = null;

module.exports = function(db, models) {
    if (UserService && UserService.instance) {
        return UserService.instance;
    }

    UserService = BaseService.extend({
        authenticate: function(credentials) {
            var deferred = Q.defer();
            
            models.User.find({ where: credentials }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }
    });

    UserService.instance = new UserService(db);
    UserService.Model = models.User;

    return UserService.instance;
};
