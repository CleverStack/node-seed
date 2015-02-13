var Class           = require( 'uberclass' )
  , EventEmitter    = require( 'events' ).EventEmitter
  , Prototype       = Object.create( EventEmitter.prototype )
  , Static          = Object.create( EventEmitter.prototype );

Prototype.setup = function() {
    EventEmitter.call( this );
    this.setMaxListeners(0);
    return this._super ? this._super.apply( this, arguments ) : arguments;
};

Static.extend = function( Static, Proto ) {
    Static = typeof Proto !== undefined ? Static : {};
    EventEmitter.call( Static );
    var Klss = this._super ? this._super.apply( this, arguments ) : arguments;
    Klss.setMaxListeners(0);
    return Klss;
}

module.exports = Class.extend( Static, Prototype );