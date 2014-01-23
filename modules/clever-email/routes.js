module.exports = function (
    app,
    EmailController,
    UserController )
{

    app.get( '/emails',           UserController.requiresLogin, EmailController.attach() );
    app.get( '/emails/:id',       UserController.requiresLogin, EmailController.attach() );
    app.post( '/emails',          UserController.requiresLogin, EmailController.attach() );
    app['delete']( '/emails/:id', UserController.requiresLogin, EmailController.attach() );
    app.post('/emails/:id/send' , UserController.requiresLogin, EmailController.attach());

};