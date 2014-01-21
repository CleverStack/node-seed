/**
 * @doc module
 * @name currencyModule.controllers:CurrencyController
 * @description
 * Sets up an example controller to showcase how to use clever-controller
 */
module.exports = function( CurrencyService ) {
    return (require('classes').Controller).extend(
    {
        service: CurrencyService
    },
    {
    });
};
