var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' );

describe( 'service.CountryService', function() {
    var CountryService = require( 'services' ).CountryService;

    describe( '.findByName( name )', function () {
        it( "should be able to find a country by it's name", function ( done ) {
            CountryService.findByName( 'Afghanistan' ).then(function ( result ) {

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' );
                expect( result ).to.have.property( 'category' ).and.equal( 'countries' );
                expect( result ).to.have.property( 'name' ).and.equal( 'Afghanistan' );
                expect( result ).to.have.property( 'code' ).and.equal( 'AF' );

                done();
            } ).fail( done );
        } );

        it( "should be able to find a stateUSA by it's name", function ( done ) {
            CountryService.findByName( 'Arkansas' ).then(function ( result ) {

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' );
                expect( result ).to.have.property( 'category' ).and.equal( 'statesUSA' );
                expect( result ).to.have.property( 'name' ).and.equal( 'Arkansas' );
                expect( result ).to.have.property( 'code' ).and.equal( 'AR' );

                done();
            } ).fail( done );
        } );

        it( "should be able to find a province Canada by it's name", function ( done ) {
            CountryService.findByName( 'New Brunswick' ).then(function ( result ) {

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' );
                expect( result ).to.have.property( 'category' ).and.equal( 'provincesCanada' );
                expect( result ).to.have.property( 'name' ).and.equal( 'New Brunswick' );
                expect( result ).to.have.property( 'code' ).and.equal( 'NB' );

                done();
            } ).fail( done );
        } );

        it( 'should return null on a non-existant country', function ( done ) {
            CountryService.findByName( 'Sesame Street' ).then(function ( result ) {
                expect( result ).not.be.ok;
                done();
            } ).fail( done );
        } );
    } );

    describe( '.findById(id)', function () {
        it( 'should return country on by its id', function ( done ) {
            CountryService.findByName( 'Anguilla' ).then(function ( result ) {
                return CountryService.findById( result.id );
            })
                .then(function ( result ) {
                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal( 'countries' );
                    expect( result ).to.have.property( 'name' ).and.equal( 'Anguilla' );
                    expect( result ).to.have.property( 'code' ).and.equal( 'AI' );
                    done();
                } ).fail( done );
        } );

        it( 'should return null on a non-existant country', function ( done ) {
            CountryService.findById( 1000000 ).then(function ( result ) {
                expect( result ).not.be.ok;
                done();
            } ).fail( done );
        } );
    } );

    describe( '.findCountryByCode( code )', function () {
        it( 'should return country on by its code', function ( done ) {
            CountryService.findCountryByCode( 'AD' ).then(function ( result ) {
                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal( 'countries' );
                    expect( result ).to.have.property( 'name' ).and.equal( 'Andorra' );
                    expect( result ).to.have.property( 'code' ).and.equal( 'AD' );
                    done();
                } ).fail( done );
        } );

        it( 'should return null on a non-existant country code', function ( done ) {
            CountryService.findCountryByCode( 'ZZZ' ).then(function ( result ) {
                expect( result ).not.be.ok;
                done();
            } ).fail( done );
        } );
    } );

    describe( '.findStateByCode( code )', function () {
        it( 'should return state on by its code', function ( done ) {
            CountryService.findStateByCode( 'VT' ).then(function ( result ) {
                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' );
                expect( result ).to.have.property( 'category' ).and.equal( 'statesUSA' );
                expect( result ).to.have.property( 'name' ).and.equal( 'Vermont' );
                expect( result ).to.have.property( 'code' ).and.equal( 'VT' );
                done();
            } ).fail( done );
        } );

        it( 'should return null on a non-existant state code', function ( done ) {
            CountryService.findStateByCode( 'ZZZ' ).then(function ( result ) {
                expect( result ).not.be.ok;
                done();
            } ).fail( done );
        } );
    } );

    describe( '.findProvinceByCode( code )', function () {
        it( 'should return province on by its code', function ( done ) {
            CountryService.findStateByCode( 'VT' ).then(function ( result ) {
                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' );
                expect( result ).to.have.property( 'category' ).and.equal( 'statesUSA' );
                expect( result ).to.have.property( 'name' ).and.equal( 'Vermont' );
                expect( result ).to.have.property( 'code' ).and.equal( 'VT' );
                done();
            } ).fail( done );
        } );

        it( 'should return null on a non-existant province code', function ( done ) {
            CountryService.findStateByCode( 'ZZZ' ).then(function ( result ) {
                expect( result ).not.be.ok;
                done();
            } ).fail( done );
        } );
    } );

    describe( '.countryList()', function () {
        it( 'should return country list', function ( done ) {
            CountryService.countryList().then(function ( result ) {
                expect( result ).to.be.an( 'array' );
                expect( result ).to.have.length( 249 );
                expect( result[0] ).to.be.an( 'object' );
                expect( result[0] ).to.have.property( 'id' );
                expect( result[0] ).to.have.property( 'category' ).and.equal( 'countries' );
                expect( result[0] ).to.have.property( 'name' ).and.equal( 'Afghanistan' );
                expect( result[0] ).to.have.property( 'code' ).and.equal( 'AF' );
                done();
            } ).fail( done );
        } );
    } );

    describe( '.statesList()', function () {
        it( 'should return state list', function ( done ) {
            CountryService.statesList().then(function ( result ) {
                expect( result ).to.be.an( 'array' );
                expect( result ).to.have.length( 50 );
                expect( result[0] ).to.be.an( 'object' );
                expect( result[0] ).to.have.property( 'id' );
                expect( result[0] ).to.have.property( 'category' ).and.equal( 'statesUSA' );
                expect( result[0] ).to.have.property( 'name' ).and.equal( 'Alabama' );
                expect( result[0] ).to.have.property( 'code' ).and.equal( 'AL' );
                done();
            } ).fail( done );
        } );
    } );

    describe( '.provincesList()', function () {
        it( 'should return province list', function ( done ) {
            CountryService.provincesList().then(function ( result ) {
                expect( result ).to.be.an( 'array' );
                expect( result ).to.have.length( 10 );
                expect( result[0] ).to.be.an( 'object' );
                expect( result[0] ).to.have.property( 'id' );
                expect( result[0] ).to.have.property( 'category' ).and.equal( 'provincesCanada' );
                expect( result[0] ).to.have.property( 'name' ).and.equal( 'Alberta' );
                expect( result[0] ).to.have.property( 'code' ).and.equal( 'AB' );
                done();
            } ).fail( done );
        } );
    } );

} );
