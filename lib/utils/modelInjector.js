'use strict';

var fs = require( 'fs' );

module.exports = function ( models ) {
	if ( models.orm && Object.keys( models.orm ).length ) {
		Object.keys( models.orm ).forEach(function( modelName ) {
			injector.instance( modelName + 'Model', models.orm[ modelName ] );
			injector.instance( modelName + 'Model', models.orm[ modelName ] );
		});

		Object.keys( models.orm ).forEach(function( modelName ) {
			injector.instance( modelName + 'Model', models.orm[ modelName ] );
			injector.instance( 'orm' + modelName + 'Model', models.orm[ modelName ] );
		});
	}

	if ( models.odm && Object.keys( models.odm ).length ) {
		Object.keys( models.odm ).forEach(function( modelName ) {
			injector.instance( 'odm' + modelName + 'Model', models.odm[ modelName ] );
		});
	}
};