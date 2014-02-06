var Module = require( 'classes' ).ModuleClass.extend( {

    configureApp: function ( app, express ) {

        app.use( express.static( this.config.pathToCsvFiles ) );

    }

} );

module.exports = new Module( 'clever-csv', injector );