var passport = require('passport');

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

  var ExampleCtrl = controller('ExampleController')
    , UserService = service('UserService', db, models.User)
    , UserCtrl = controller('UserController', UserService);

  // Some passport use
  // app.get('/auth/facebook', passport.authenticate('facebook', {
  //     scope: ['email', 'user_location', 'user_photos']
  // }));
  // app.get('/auth/facebook/callback', UserCtrl.attach('facebookLoginAction'));

  app.all('/api/example/:action/:id?', ExampleCtrl.attach());
  app.all('/api/example/?:action?', ExampleCtrl.attach());

  // User Routes
  app.get('/user/current', UserCtrl.attach());
  app.post('/user/login', UserCtrl.attach());
  app.post('/user', UserCtrl.attach());
  app.all('/user/:action/:id?', UserCtrl.requiresLogin, UserCtrl.attach());
  app.all('/user/?:action?', UserCtrl.requiresLogin, UserCtrl.attach());
};
