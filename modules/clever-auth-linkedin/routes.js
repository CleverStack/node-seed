module.exports = function (
    app,
    UserLinkedinController )
{

    app.all('/auth/linkedin/?:action?',  UserLinkedinController.attach() );

};

