module.exports = function( app, ExampleController, TestModel ) {
    // Define routes here
    app.all('/example/:action/:id?', ExampleController.attach());
    app.all('/example/?:action?', ExampleController.attach());
}