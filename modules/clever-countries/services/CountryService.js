var BaseService = require( 'services' ).BaseService
  , CountryService = null
  , Q = require( 'q' )
  , _ = require( 'lodash' )
  , config = require( 'config' )[ 'clever-countries' ];

var categories = [ 'countries', 'statesUSA', 'provincesCanada' ]
  , errMs = { statuscode: 400, message: "Insufficient data" };

var normalize = function ( data ) {
    var result;
    var norm = function ( obj ) {
        return {
            id: obj._id || obj.id,
            name: obj.name,
            code: obj.code,
            category: obj.category
        }
    };

    if ( _.isArray( data ) ) {
        result = [];
        _.forEach( data, function ( obj ) {
            result.push ( norm ( obj ) );
        } );
        result = _.sortBy( result, 'name' );
    } else if ( _.isObject( data ) ) {
        result = norm ( data );
    } else {
        result = data;
    }

    return result;
};

var findCategory = function ( category ) {
    var index = -1;
    if ( !!category && _.isString( category ) ) {
        var index = _.findIndex( categories, function ( val ) {
            return val.toLowerCase() === category.toLowerCase();
        } );
    }

    return index === -1 ? categories [ 0 ] : categories [ index ];
};

module.exports = function ( sequelize, ORMCountryModel, ODMCountryModel ) {
    if ( CountryService && CountryService.instance ) {
        return CountryService.instance;
    }

    CountryService = BaseService.extend( {

        findById: function ( id ) {
            var deferred = Q.defer()
              , query = config.mongo ? { _id: id } : { where: { id: id } };

            this.find( query )
                .then( function ( result ) {
                    if ( !result ) {
                        return deferred.resolve( null );
                    }

                    deferred.resolve( normalize( result[0] ) );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        findByName: function ( name ) {
            var self = this
              , deferred = Q.defer()
              , query = config.mongo ? { name: name } : { where: { name: name } };

            self.find( query )
                .then( function ( result ) {
                    if ( !result ) {
                        return deferred.resolve( null );
                    }

                    deferred.resolve( normalize( result [ 0 ] ) );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        findByCodeAndCategory: function ( code, category  ) {
            var deferred = Q.defer();

            if ( !arguments.length ) {
                deferred.resolve( errMs );
                return deferred.promise;
            }

            var obj = {
                category: findCategory ( category || '' ),
                code: code.toUpperCase()
            };

            var query = config.mongo ? obj : { where: obj };

            this.find( query )
                .then( function ( result ) {
                    if ( !result ) {
                        return deferred.reject( null );
                    }

                    deferred.resolve( normalize( result [ 0 ] ) );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        findCountryByCode: function ( code ) {
            return this.findByCodeAndCategory( code );
        },

        findStateByCode: function ( code ) {
            return this.findByCodeAndCategory( code, 'statesUSA' );
        },

        findProvinceByCode: function ( code ) {
            return this.findByCodeAndCategory( code, 'provincesCanada' );
        },

        list: function ( category ) {
            var deferred = Q.defer();

            var obj = {
                category: findCategory ( category || '' )
            };
            var query = config.mongo ? obj : { where: obj };

            this.find( query )
                .then( function ( result ) {
                    if ( !result ) {
                        return deferred.reject( null );
                    }

                    deferred.resolve( normalize( result ) );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        countryList: function (){
            var deferred = Q.defer();

            this.list( 'countries' )
                .then( function ( result ) {
                    deferred.resolve( result );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        statesList: function (){
            var deferred = Q.defer();

            this.list( 'statesUSA' )
                .then( function ( result ) {
                    deferred.resolve( result );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        provincesList: function (){
            var deferred = Q.defer();

            this.list( 'provincesCanada' )
                .then( function ( result ) {
                    deferred.resolve( result );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        }

    } );

    CountryService.instance = new CountryService( sequelize );
    CountryService.Model = !config.mongo ? ORMCountryModel : ODMCountryModel;

    return CountryService.instance;
};
