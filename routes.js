module.exports = function(app) {
	// Setup so we can Inject Dependencies into our routes
	var loader = app.get('loader')
	  , controller = loader()
	  , service = loader()
	  , config = app.get('config')
	  , models = app.get('models')
	  , db = app.get('db');

	// Custom storage path for controllers loader
	controller.storage = __dirname + '/src/controllers/';
	service.storage = __dirname + '/src/service/';

	// Dependency injection happens now, Load our controllers
	var ExampleCtrl = controller('ExampleController', models);

	// Example routes
	app.all('/example/:action/:id?', ExampleCtrl.attach());
	app.all('/example/?:action?', ExampleCtrl.attach());

	var UserService = service('UserService', db, models.User)
	  , UserCtrl = controller('UserController', UserService)

	// User Routes
	app.post('/user/login', UserCtrl.attach())

	app.all('/user/:action/:id?', UserCtrl.requiresLogin, UserCtrl.attach());
	app.all('/user/?:action?', UserCtrl.requiresLogin, UserCtrl.attach());
};