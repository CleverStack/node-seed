/**
 * Abstract Search Base class. Holds common properties
 * like limit, offset, etc. It's just a glorified
 * parameter container, but these things are useful
 * for cleaning up a controller by moving custom search
 * logic out of the controllers.
 *
 * TODO: Make example controller using a search
 */

var Base = require('./Base'),
	util = require('util');

function Search(data) {
	this.intProp('limit');
	this.intProp('offset', 0);
	this.strProp('orderBy');
	this.boolProp('orderDir', true);
	Base.call(this, data);
}

util.inherits(Search, Base);

Search.hydrate = function(data) {
	return new Search(data);
};

Search.export = function(o) {
	return Base.export(o);
};

module.exports = Search;
