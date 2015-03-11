var injector   = require('injector')
  , utils      = require('utils');

module.exports = function setupNestedOperations(Klass, modelName, model, debug) {
  injector.getInstance('moduleLoader').on('routesInitialized', function() {
    debug( 'Parsing templated event handlers...' );
    Object.keys( Klass ).forEach( function( propName ) {
      if ( propName.indexOf( ' ' ) !== -1 || utils.model.helpers.eventNames.indexOf( propName ) !== -1 ) {
        var parts       = propName.split( ' ' )
          , resource    = parts.length === 2 ? parts.shift() : modelName + 'Model'
          , eventName   = parts.shift();

        injector.getInstance( resource ).on( eventName, model.callback( propName ) );
      }
    });
  });
};