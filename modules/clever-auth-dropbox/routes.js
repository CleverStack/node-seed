module.exports = function (
    app,
    UserDropboxController )
{

    app.all('/auth/dropbox/?:action?',  UserDropboxController.attach() );

};

