var Class = require( 'uberclass' )
  , EventEmitter = require( 'events' ).EventEmitter
  , uberUtil = require( 'utils' ).uberUtil;

module.exports = Class.extend( uberUtil.inherits( {}, EventEmitter ) );