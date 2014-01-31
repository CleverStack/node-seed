module.exports = function (
    app,
//    AccountController,
    UserController )
{

    app.all('/user/?:action?',      UserController.attach());

    app.post('/users/confirm',      UserController.checkPasswordRecoveryData,   UserController.attach());

//    app.post('/users/confirm',      UserController.attach());
//    app.get('/users',               UserController.attach());
//    app.post('/users',              UserController.attach());
//    app.get('/users/:id',           UserController.attach());
//    app.put('/users/:id',           UserController.attach());
//    app.post('/users/:id',          UserController.attach());

//    app.post('/users/confirm',      UserController.checkPasswordRecoveryData,   UserController.attach());
//    app.get('/users',               UserController.requiresLogin,               UserController.attach());
//    app.post('/users',              UserController.requiresLogin,               UserController.attach());
//    app.get('/users/:id',           UserController.requiresLogin,               UserController.isUserInTheSameAccount, UserController.attach());
//    app.put('/users/:id',           UserController.requiresLogin,               UserController.isUserInTheSameAccount, UserController.attach());
//    app.post('/users/:id',          UserController.requiresLogin,               UserController.isUserInTheSameAccount, UserController.attach());




//    app.post('/users/:id/resend',   UserController.requiresAdminRights,         UserController.attach());
//    app.get('/user/current',        UserController.attach());
//    app.get('/user/logout',         UserController.requiresLogin,               UserController.attach());
//    app.post('/user/login',         UserController.attach());
//    app.post('/user/recover',       UserController.attach());
//    app.post('/user/reset',         UserController.checkPasswordRecoveryData,   UserController.attach());
//
//    app['delete']('/users/:id',     UserController.requiresLogin,               UserController.isUserInTheSameAccount, UserController.attach());
//    app.all('/user/:action/:id?',   UserController.requiresLogin,               UserController.attach());
//    app.all('/user/?:action?',      UserController.requiresLogin,               UserController.attach());

//    app.get('/account',             UserController.requiresLogin,               AccountController.attach());
//    app.put('/account',             UserController.requiresLogin,               AccountController.formatData, AccountController.attach());
//    app.post('/account',            AccountController.isValidEmailDomain,       AccountController.requiresUniqueSubdomain, AccountController.requiresUniqueUser, AccountController.attach());
//    app.post('/account/confirm',    AccountController.attach());
//    app.post('/account/resend',     AccountController.attach());

};