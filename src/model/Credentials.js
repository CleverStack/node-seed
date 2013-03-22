/**
 * Really Dumb Credentials model
 *
 * @author Mason Houtz <mason@clevertech.biz>
 */

var Base = require('./Base'),
	util = require('util');


function Credentials(fields) {
	this.strProp('username');
	this.strProp('password');
	Base.call(this, fields);
}

util.inherits(Credentials, Base);

module.exports = Credentials;