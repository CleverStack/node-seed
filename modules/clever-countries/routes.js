module.exports = function ( app, CountryController ) {

    app.get( '/countries/?', CountryController.attach() );
    app.post( '/countries/?', CountryController.attach() );
};