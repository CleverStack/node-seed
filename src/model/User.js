/**
 * Really Dumb User model
 *
 * @author Mason Houtz<mason@clevertech.biz>
 */

var Base = require('./Base'),
	util = require('util');


function User(fields) {
	
	this.intProp('id');
	this.strProp('firstname');
	this.strProp('lastname');
	this.strProp('email');
	this.strProp('password');
	this.strProp('phone');
	

	var roles = [];
	
	this.roles = function(newRoles) {
		if (newRoles)
			roles = newRoles;
		return roles;
	};

	Base.call(this, fields);
}

util.inherits(User, Base);


// "static" methods

User.hydrate = function(fields) {
	return new User(fields);
};

User.export = function(o) {
	return Base.export(o);
};

module.exports = User;