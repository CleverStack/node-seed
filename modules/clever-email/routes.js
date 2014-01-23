module.exports = function (
    app,
    EmailController ) {

    app.get( '/emails',                         EmailController.attach() );
    app.get( '/emails/:id',                     EmailController.attach() );
    app.post( '/emails',                        EmailController.attach() );
    app['delete']( '/emails/:id',               EmailController.attach() );
    app.post('/emails/:id/send' ,               EmailController.attach());

};