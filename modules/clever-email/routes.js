module.exports = function (
    app,
    EmailController,
    EmailTemplateController ) {

//    app.get( '/email_templates/:id/preview',    UserController.requiresLogin, EmailTemplateController.attach() );
//    app.get( '/email_templates',                UserController.requiresLogin, EmailTemplateController.attach() );
//    app.get( '/email_templates/:id',            UserController.requiresLogin, EmailTemplateController.attach() );
//    app.post( '/email_templates',               UserController.requiresLogin, EmailTemplateController.checkRequiredFields, EmailTemplateController.attach() );
//    app.post( '/email_templates/:id',           UserController.requiresLogin, EmailTemplateController.checkRequiredFields, EmailTemplateController.attach() );
//    app['delete']( '/email_templates/:id',      UserController.requiresLogin, EmailTemplateController.attach() );
//    //app.post('/emails/:id/send' ,             UserController.requiresLogin, EmailTemplateController.attach());
//    //app.get('/emails/:id/permission' ,        UserController.requiresLogin, EmailTemplateController.attach());
//
//    app.get( '/emails',                         UserController.requiresLogin, EmailController.attach() );
//    app.get( '/emails/:id',                     UserController.requiresLogin, EmailController.attach() );
//    app.post( '/emails',                        UserController.requiresLogin, EmailController.attach() );
//
//    app.post( '/emails/:pubkey/eventsMail',     EmailController.checkEventMailData, EmailController.attach() );

    app.get( '/email_templates/:id/preview',    EmailTemplateController.attach() );
    app.get( '/email_templates',                EmailTemplateController.attach() );
    app.get( '/email_templates/:id',            EmailTemplateController.attach() );
    app.post( '/email_templates',               EmailTemplateController.checkRequiredFields, EmailTemplateController.attach() );
    app.post( '/email_templates/:id',           EmailTemplateController.checkRequiredFields, EmailTemplateController.attach() );
    app['delete']( '/email_templates/:id',      EmailTemplateController.attach() );

    app.get( '/emails',                         EmailController.attach() );
    app.get( '/emails/:id',                     EmailController.attach() );
    app.post( '/emails',                        EmailController.attach() );

    app.post( '/emails/:pubkey/eventsMail',     EmailController.checkEventMailData, EmailController.attach() );

};