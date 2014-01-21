var Q = require('q')
  , CurrencyService;

module.exports = function( sequelize, ORMCurrencyModel ) {
    CurrencyService = require( 'services' ).BaseService.extend({});

    if ( !CurrencyService.instance ) {
        CurrencyService.instance = new CurrencyService( sequelize );
        CurrencyService.Model = ORMCurrencyModel;
    }
    
    return CurrencyService.instance;
};
