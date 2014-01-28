module.exports = function (
    app,
    FileController )
{

    app.all( '/files/:id?',   FileController.attach() );

};