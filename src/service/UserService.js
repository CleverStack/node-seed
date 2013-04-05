var BaseClass = require(__dirname + '/Base')
  , Q = require('q')
  , UserService = null
  , instance = null;

module.exports = function(Db, UserModel) {
	if (instance === null) {
		UserService = BaseClass.extend({
			findById: function(id) {
				var deferred = Q.defer();
				UserModel.find(id).success(deferred.resolve).error(deferred.reject)
				return deferred.promise
			},

			findAll: function(options) {
				options || {}
				var deferred = Q.defer();
				UserModel.findAll().success(deferred.resolve).error(deferred.reject)
				return deferred.promise
			},

			find: function(options) {
				options || {}
				var deferred = Q.defer();
				UserModel.findAll(options).success(deferred.resolve).error(deferred.reject)
				return deferred.promise
			},

			authenticate: function(credentials) {
				var deferred = Q.defer();
				
				/*
				var sql = "select * from \"Users\" where email = '" + credentials.username + "' \
							and password = contrib.crypt(id || '" + credentials.password + "', password);";
				this.query(sql).success(function(models) {
					models.length ? deferred.resolve(models[0]) : deferred.reject('Incorrect username/password');
				}).error(deferred.reject);
				*/
				
				// For now so the stub app works
				UserModel.find({ where: credentials }).success(deferred.resolve).error(deferred.reject);

				return deferred.promise;
			}
		});

		instance = new UserService(Db);
	}

	return instance;
}