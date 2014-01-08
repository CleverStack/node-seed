module.exports = ( require( './classes/ModuleClass' ) ).extend({
	init: function() {
		console.log( 'inside the extending class for the application module' );
	}
});