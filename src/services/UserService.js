var BaseService = require('services').BaseService
  , Q = require('q');

module.exports = function(db, UserModel) {
    var UserService = BaseService.extend({
        authenticate: function(credentials) {
            var deferred = Q.defer();
            
            UserModel.find({ where: credentials }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }
    });

    UserService.Model = UserModel;
    return new UserService(db);
};
