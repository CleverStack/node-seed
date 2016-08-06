module.exports = function( app, CurrencyController, ORMCurrencyModel ) {
    // Define routes here
    app.all('/currency/:action/:id?', CurrencyController.attach());
    app.all('/currency/?:action?', CurrencyController.attach());
}
