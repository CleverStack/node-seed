module.exports = function (
    app,
    UserTwitterController )
{

    app.all('/auth/twitter/?:action?',  UserTwitterController.attach() );

};