var BaseService    = require('./BaseService')
,   CountryService = null
,   Q = require('q');

module.exports = function (db, AttributeValueService, AttributeKeyService, AttributeDocumentService, ODMAttributeValueModel) {
    if (CountryService && CountryService.instance) {
        return CountryService.instance;
    }

    CountryService = BaseService.extend( {

        normalize: function (r) {
            return r.map(function (r) {
                obj = r.toObject();
                return {id: r._id, code: obj.code.value, name: obj.name.value};
            });
        },

        findById: function (id) {
            var self     = this
            ,   deferred = Q.defer();

            AttributeValueService.findById(id).then(function ( country ) {
                if (!country) {
                    return deferred.resolve( null );
                }

                var country = self.normalize([country]);
                deferred.resolve(country);
            } )
            .fail( deferred.reject );

            return deferred.promise;
        },

        findByCountryCode: function ( code ) {
            var self     = this
            ,   deferred = Q.defer()
            ,   obj      = {
                "code.value": code.toUpperCase() || ""
            };

            self.find( obj )
            .then( function ( result ) {
                if (!result) {
                    return deferred.reject( [] );
                }

                var result = self.normalize(result);
                deferred.resolve(result);
            } )
            .fail( deferred.reject );

          return deferred.promise;
        },

        findByCode: function ( code ) {
            return this.findByCountryCode( code );
        },

        findByName: function (name) {
            var self     = this
            ,   deferred = Q.defer()
            ,   obj      = {
                "name.value": name || ""
            };

            self.find( obj )
            .then( function ( result ) {
                if (!result) {
                    return deferred.reject( [] );
                }

                var result = self.normalize(result);
                deferred.resolve(result[0]);
            } )
            .fail( deferred.reject );

            return deferred.promise;
        },

        list: function (orderBy, sort) {
            var self     = this
            ,   deferred = Q.defer();

            AttributeKeyService.findByCategory('Countries').then( function ( result ) {
                var modelKeys = result.map( function ( r ) {
                    return r.name.toLowerCase();
                } );

                var _orderBy = !!orderBy && modelKeys.indexOf( orderBy.toLowerCase() ) > -1 ? orderBy : 'name';
                _orderBy += '.value';

                var _sorted = !!sort && ['desc', 'asc'].indexOf( sort.toLowerCase() ) > -1 ? ( ['desc', 'asc'].indexOf( sort.toLowerCase() ) * 2 - 1 ) : 1;
                var sortWay = {};
                sortWay[_orderBy] = _sorted;

                AttributeDocumentService.find( {"name": "Countries"} )
                .then( function ( country ) {
                    AttributeValueService
                    .findExtended( {AttributeDocumentId: country[0]._id}, null, {sort: sortWay} )
                    .then( function ( result ) {
                        if (!result.length) {
                            return deferred.resolve( {} );
                        }

                        var result = self.normalize( result );
                        deferred.resolve( result );
                    } )
                    .error( deferred.reject );
                } )
                .error( deferred.reject );
            } );

            return deferred.promise;
        }

    } );

    CountryService.instance = new CountryService(db);
    CountryService.Model    = ODMAttributeValueModel;

    return CountryService.instance;
};
