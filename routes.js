module.exports = function(app) {
	// Setup so we can Inject Dependencies into our routes
	var loader = app.get('loader')
	  , controller = loader()
	  , config = app.get('config')
	  , models = app.get('models');

	// Custom storage path for controllers loader
	controller.storage = __dirname + '/src/controllers/';

	// Dependency injection happens now, Load our controllers
	var UserCtrl = controller('UserController', models.User)
	  , AuthCtrl = controller('AuthController', models)
	  , ExampleCtrl = controller('ExampleController', models);

	// Example routes
	app.all('/example/:action/:id?', ExampleCtrl.attach())
	app.all('/example/?:action?', ExampleCtrl.attach())

	// Auth Routes
	app.all('/auth/:action', AuthCtrl.attach());

	// User Routes
	app.all('/user/:action/:id?', AuthCtrl.requiresLogin, UserCtrl.attach());
	app.all('/user/?:action?', AuthCtrl.requiresLogin, UserCtrl.attach());
};
