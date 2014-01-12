module.exports = function ( app, CountryController ) {
	app.all( '/countries/?:action?', CountryController.attach() );
};