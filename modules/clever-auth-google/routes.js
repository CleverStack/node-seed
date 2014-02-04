module.exports = function (
    app,
    UserGoogleController )
{

    app.all('/auth/google/?:action?',  UserGoogleController.attach() );

};