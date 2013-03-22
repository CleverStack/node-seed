/**
 * Real basic service example. Used for authentication
 * as well. In a more robust project I'd make a separate
 * Authentication service too.
 *
 * @author Mason Houtz <mason@nerdinacan.com>
 */


var User = require('../model/User'),
	Base = require('./Base'),
	util = require('util');



function UserService(dbConfigs) {
	Base.call(this, dbConfigs);
}

util.inherits(UserService, Base);



UserService.prototype.getById = function(id) {

	var sql = "select * from user where id = $1";

	return this.query(sql, arguments)
				.then(function(result) {
					return User.hydrate(result.rows[0]);
				});
};

UserService.prototype.getAll = function() {

	var sql = "select * from auth.user";

	return this.query(sql)
		.then(function(result) {
			return result.rows.map(User.hydrate);
		});
};


UserService.prototype.search = function(searchContainerModel) {
	throw new Error("Unimplemented method");
};


UserService.prototype.save = function(u) {

	var sql = "select * from auth.save_user($1, $2, $3, $4, $5)";

	var params = [ u.id(), u.email(), u.password(), 
		u.firstname(), u.lastname() ];

	return this.query(sql, params)
				.then(function(result) {
					return User.hydrate(result.rows[0]);
				});

};


UserService.prototype.authenticate = function(credentials) {

	var sql = "select * from auth.user where email = $1 \
				and password = contrib.crypt(id || $2, password);";

	var params = [ credentials.username(), credentials.password() ];

	return this.query(sql, params)
			.then(function(result) {
				return User.hydrate(result.rows[0]);
			});
};


UserService.prototype.authorize = function(user) {

	var sql = "select r.name from auth.user_role ur \
				inner join role r on (ur.role_id = r.id) \
				where user_id = $1";

	var params = [ user.id() ];
	
	return this.query(sql, params)
			.then(function(result) {
				var roles = result.rows.map(function(row) {
					return row.name;
				});
				user.roles(roles);
				return user;
			});
};




// Statics
UserService.instance = null;


module.exports = function(configs) {
	if (UserService.instance === null)
		UserService.instance = new UserService(configs);
	return UserService.instance;
};
