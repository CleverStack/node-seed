var BaseService = require('./BaseService')
  , Q = require('q');

module.exports = function(db, models) {
    var UserService = BaseService.extend({
        authenticate: function(credentials) {
            var deferred = Q.defer();
            
            models.User.find({ where: credentials }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }
    });

    UserService.Model = models.User;
    return new UserService(db);
};
