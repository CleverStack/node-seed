module.exports = function (
    app,
    EmailController,
    EmailAlertController,
    EmailTemplateController ) {

    app.get( '/email_templates/:id/preview',    UserController.requiresLogin, EmailTemplateController.attach() );
    app.get( '/email_templates',                UserController.requiresLogin, EmailTemplateController.attach() );
    app.get( '/email_templates/:id',            UserController.requiresLogin, EmailTemplateController.attach() );
    app.post( '/email_templates',               UserController.requiresLogin, EmailTemplateController.checkRequiredFields, EmailTemplateController.attach() );
    app.post( '/email_templates/:id',           UserController.requiresLogin, EmailTemplateController.checkRequiredFields, EmailTemplateController.attach() );
    app['delete']( '/email_templates/:id',      UserController.requiresLogin, EmailTemplateController.attach() );
    //app.post('/emails/:id/send' ,             UserController.requiresLogin, EmailTemplateController.attach());
    //app.get('/emails/:id/permission' ,        UserController.requiresLogin, EmailTemplateController.attach());

    app.get( '/emails',                         UserController.requiresLogin, EmailController.attach() );
    app.get( '/emails/:id',                     UserController.requiresLogin, EmailController.attach() );
    app.post( '/emails',                        UserController.requiresLogin, EmailController.attach() );

    app.post( '/emails/:pubkey/eventsMail',     EmailController.checkEventMailData, EmailController.attach() );

    app.all('/alerts/?',                        UserController.requiresLogin, EmailAlertController.attach());
    app.put('/alerts/?',                        UserController.requiresLogin, EmailAlertController.attach());
    app.get('/alerts/:id/?',                    UserController.requiresLogin, EmailAlertController.attach());
    app['delete']('/alerts/:id/?',              UserController.requiresLogin, EmailAlertController.attach());

};