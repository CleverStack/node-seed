/**
 * Loader utility for dependency injection. Finds the class according to the
 * passed "name" parameter, then injects the rest of the dependencies
 * into a new instance of that controller class.
 *
 * @author Mason Houtz <mason@clevertech.biz>
 */

module.exports = function() {

	// utility for loading a controller and injecting indicated dependencies
	function loader(/* name, dependency, dependency, ... */) {
		var name = Array.prototype.shift.apply(arguments);
		var fnObjectFactory = require(loader.storage + name);
		return fnObjectFactory.apply(null, arguments);
	}

	// base storage path, can be set externally if so desired to find
	// controllers in different paths
	loader.storage = './';

	return loader;

};