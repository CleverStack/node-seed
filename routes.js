module.exports = function(app) {
	// Setup so we can Inject Dependencies into our routes
	var loader = app.get('loader')
	  , controller = loader()
	  , config = app.get('config')
	  , models = app.get('models');

	// Custom storage path for controllers loader
	controller.storage = __dirname + '/src/controllers/';

	// Dependency injection happens now, Load our controllers
	var UserCtrl = controller('UserController', models.User, models.Role)
	  , ExampleCtrl = controller('ExampleController', models);

	// Example routes
	app.all('/example/:action/:id?', ExampleCtrl.attach())
	app.all('/example/?:action?', ExampleCtrl.attach())

	// User Routes
	app.post('/user/login', UserCtrl.attach())

	app.all('/user/:action/:id?', UserCtrl.requiresLogin, UserCtrl.attach());
	app.all('/user/?:action?', UserCtrl.requiresLogin, UserCtrl.attach());
};
