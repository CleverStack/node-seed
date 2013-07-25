var BaseService = require('./BaseService')
  , Q = require('q')
  , UserService = null;

module.exports = function(Db, UserModel) {
    if (UserService && UserService.instance) {
        return UserService.instance;
    }

	if (UserService === null) {
		UserService = BaseService.extend({
			authenticate: function(credentials) {
				var deferred = Q.defer();
				
				UserModel.find({ where: credentials }).success(deferred.resolve).error(deferred.reject);

				return deferred.promise;
			}
		});

		UserService.instance = new UserService(Db);
        UserService.Model = UserModel;
	}

	return UserService.instance;
}
