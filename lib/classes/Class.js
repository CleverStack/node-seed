var Class 			= require( 'uberclass' )
  , EventEmitter 	= require( 'events' ).EventEmitter
  , Prototype 		= Object.create( EventEmitter.prototype )
  , Static 			= Object.create( EventEmitter.prototype );

Prototype.setup = function() {
	EventEmitter.call( this );
	return this._super ? this._super.apply( this, arguments ) : arguments;
};

Static.extend = function( Static, Proto ) {
	Static = typeof Proto !== undefined ? Static : {};
	EventEmitter.call( Static );
	return this._super ? this._super.apply( this, arguments ) : arguments;
}

module.exports = Class.extend( Static, Prototype );