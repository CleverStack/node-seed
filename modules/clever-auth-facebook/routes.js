module.exports = function (
    app,
    UserFacebookController )
{

    app.all('/auth/facebook/?:action?',  UserFacebookController.attach() );

};