var config = require( 'config' );

module.exports = function ( CountryService ) {
    return (require( 'classes' ).Controller).extend(
        {
            service: CountryService
        },
        /* @Prototype */
        {

            listAction: function () {
                var query = this.req.query
                  , action;

                if ( config.statesUSA && query.hasOwnProperty( 'state' ) ) {
                    action = CountryService.statesList()
                } else if ( config.provincesCanada && query.hasOwnProperty( 'province' ) ) {
                    action = CountryService.provincesList()
                } else {
                    action = CountryService.countryList()
                }

                return action
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            postAction: function () {
                var action
                  , data = this.req.body;

                if ( !!data.name ) {
                    action = CountryService.findByName( data.name );
                }
                else if ( !!data.id ) {
                    action = CountryService.findById( data.id );
                }
                else if ( !!data.countryCode ) {
                    action = CountryService.findCountryByCode( data.countryCode );
                }
                else if ( config.statesUSA && !!data.stateCode ) {
                    action = CountryService.findStateByCode( data.stateCode );
                }
                else if ( config.provincesCanada && !!data.provinceCode ) {
                    action = CountryService.findProvinceByCode( data.provinceCode );
                }
                else {
                    return this.send( 'Insufficient data', 400 );
                }

                return action
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {
                if ( !!obj && obj.statuscode ) {
                    return this.send( obj.message, obj.statuscode );
                } else {
                    return this.send( obj, 200 );
                }
            },

            handleException: function ( exception ) {
                if ( typeof exception !== "object" || !exception.stack ) {
                    return this.send( 500, exception );
                }
                this._super( exception );
            }
        } );
};