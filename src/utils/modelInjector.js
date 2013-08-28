'use strict';

var fs = require( 'fs' );

module.exports = function ( injector, models ) {
	Object.keys( models ).forEach(function( modelName ) {
		injector.instance( modelName + 'Model', models[ modelName ] );
	});
};