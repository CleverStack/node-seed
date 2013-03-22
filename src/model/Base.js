/**
 * Base model class
 * @author  Mason Houtz <mason@nerdinacan.com>
 */

var sanitize = require('validator').sanitize,
	moment = require('moment');
	

function Base(fields) {
	this.populate(fields);
}

Base.prototype.populate = function(fields) {
	fields = fields || {};
	for (var prop in fields) {
		if (this.hasOwnProperty(prop)) {
			if (typeof(this[prop]) === "function") {
				this[prop](fields[prop]);
			}
			
		}
	}
};

Base.prototype.intProp = function(propName, def) {
	this.buildAccessor(propName, def, function(val) {
		return sanitize(val).toInt();
	});
};

Base.prototype.decimalProp = function(propName, def) {
	this.buildAccessor(propName, def, function(val) {
		var decimalVal = Math.floor(val * 100.0) / 100.0;
		return Number(decimalVal);
	});
};


Base.prototype.strProp = function(propName, def) {
	this.buildAccessor(propName, def, function(val) {
		val = sanitize(val).trim();
		return sanitize(val).xss();
	});
};

Base.prototype.boolProp = function(propName, def) {
	this.buildAccessor(propName, def, function(val) {
		return sanitize(val).toBoolean();
	});
};

Base.prototype.dateProp = function(propName, def, format) {
	format = format || 'YYYY-MM-DD';
	this.buildAccessor(propName, def, function(val) {
		var d = moment().utc(val);
		return d.isValid() ? d.format(format) : null;
	});
};

Base.prototype.buildAccessor = function(propName, def, fn) {

	// start with null
	var storage = null;

	// define accessor function
	this[propName] = function(val) {
		if (val === null) {
			storage = null;
		}
		else if (undefined !== val) {
			storage = fn(val);
		}
		return storage;
	};

	// set to default value
	if (def !== undefined)
		this[propName](def);

};

Base.prototype.export = function() {
	return Base.export(this);
};

Base.export = function(o) {
	var result = {};
	Object.keys(o).forEach(function(prop) {
		if (typeof(o[prop]) == 'function')
			result[prop] = o[prop]();
	});
	return result;
};


module.exports = Base;