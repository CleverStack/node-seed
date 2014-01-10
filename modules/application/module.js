var Module = require( 'classes' ).ModuleClass.extend({
    configureApp: function( app, express ) {
    	app.use( express.urlencoded() );
    	app.use( express.json() );
    	app.use( express.logger('dev') );
    	app.use( express.compress() );
    	app.use( express.favicon() );
    	app.use( express.methodOverride() );
    }
});

module.exports = new Module( 'application', injector )