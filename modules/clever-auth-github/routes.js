module.exports = function (
    app,
    UserGithubController )
{

    app.all('/auth/github/?:action?',  UserGithubController.attach() );

};