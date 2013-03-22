/**
 * ROUTE DEFINITIONS
 *
 * @author Mason Houtz <mason@clevertech.biz>
 */


// LOADER Utilities
// These things cache the controllers and the services with their dependencies. 
// Nothing fancy, they are expressed as factory functions in case I later feel 
// the need to inject configuration information into the general loaders.

var loader = require('./src/components/Loader.js');
	
var service = loader(/* configs? */);
service.storage = __dirname + '/src/service/';

var controller = loader(/* configs? */);
controller.storage = __dirname + '/src/controllers/';


module.exports = function(app) {

	// Dependency injection happens now.
	var config = app.get('config');
	var userService = service('UserService', config.db);
	var AUTH = controller('AuthController', userService);
	var USER = controller('UserController', userService);

	// Auth Routes
	app.get('/auth/logout', AUTH.logout);
	app.post('/auth/login', AUTH.login);

	// User Routes
	app.get('/user', AUTH.requiresLogin, USER.list);
	// app.get('/user/:id', Auth.requiresLogin, USER.get);
	// app.post('/user', AUTH.requiresLogin, USER.hydrate, USER.save);
	// app.put('/user/:id', AUTH.requiresLogin, USER.hydrate, USER.save);

};
