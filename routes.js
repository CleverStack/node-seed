var passport = require('passport');

module.exports = function(app) {
    var injector = app.get('injector');
  
    injector.inject(function (ExampleController, UserController, MongoController) {
        app.all('/example/:action/:id?', ExampleController.attach());
        app.all('/example/?:action?', ExampleController.attach());

        app.all('/mongo/:action/:id?', MongoController.attach());
        app.all('/mongo/?:action?', MongoController.attach());

        // Some passport use
        // app.get('/auth/facebook', passport.authenticate('facebook', {
        //     scope: ['email', 'user_location', 'user_photos']
        // }));
        // app.get('/auth/facebook/callback', UserController.attach('facebookLoginAction'));

        app.get('/user/current', UserController.attach());
        app.post('/user/login', UserController.attach());
        app.post('/user', UserController.attach());
        app.all('/user/:action/:id?', UserController.requiresLogin, UserController.attach());
        app.all('/user/?:action?', UserController.requiresLogin, UserController.attach());
    });
};
