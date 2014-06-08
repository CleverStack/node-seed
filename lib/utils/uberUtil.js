var _ = require( 'underscore' )

module.exports = {

	inherits: function( proto, inherits ) {
		var inheritsProto = Object.create( inherits.prototype )
		  , originalSetup = proto.setup;

		// Modify the constructor so we can extend
		proto.setup = function() {
			inherits.call( this );

			if ( !!originalSetup ) {
				originalSetup._super = this._super;
				return originalSetup.apply( this, arguments );
			} else {
				return ( typeof this._super === 'function' && this._super !== arguments.callee.caller )
				 ? this._super.apply( this, arguments )
				 : arguments;
			}
		};

		return _.extend( proto, inheritsProto );
	}

}