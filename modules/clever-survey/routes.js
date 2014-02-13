module.exports = function (
    app,
    SurveyController )
{

    app.all('/surveys/?:id?',       SurveyController.attach());

};