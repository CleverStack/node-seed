var Controller = require( './Controller' )
  , EventEmitter = require( 'events' ).EventEmitter
  , uberUtil = require( 'utils' ).uberUtil;

module.exports = Controller.extend( uberUtil.inherits( {}, EventEmitter ) );