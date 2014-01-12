var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' )
  , provinceId
  , countryId
  , stateId;

describe('controllers.CountryController', function () {

    describe('.listAction()', function() {
        it('should give us a list of countries', function( done ) {
            var req = request( app ).get( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length( 249 );
                    expect( result[0] ).to.have.property( 'id' );
                    expect( result[0] ).to.have.property( 'category' ).and.equal ( 'countries' );
                    expect( result[0] ).to.have.property( 'name' ).and.equal ( 'Afghanistan' );
                    expect( result[0] ).to.have.property( 'code' ).and.equal ( 'AF' );

                    done();
                });
        });

        it('should give us a list of states', function( done ) {
            var req = request( app ).get( '/countries/?state' );
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length( 50 );
                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.have.property( 'id' );
                    expect( result[0] ).to.have.property( 'category' ).and.equal( 'statesUSA' );
                    expect( result[0] ).to.have.property( 'name' ).and.equal( 'Alabama' );
                    expect( result[0] ).to.have.property( 'code' ).and.equal( 'AL' );

                    done();
                });
        });

        it('should give us a list of states', function( done ) {
            var req = request( app ).get( '/countries/?province' );
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length( 10 );
                    expect( result[0] ).to.be.an( 'object' );
                    expect( result[0] ).to.have.property( 'id' );
                    expect( result[0] ).to.have.property( 'category' ).and.equal( 'provincesCanada' );
                    expect( result[0] ).to.have.property( 'name' ).and.equal( 'Alberta' );
                    expect( result[0] ).to.have.property( 'code' ).and.equal( 'AB' );

                    done();
                });
        });
    });

    describe('.postAction()', function() {
        it('should give us a country by name', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {name: 'Andorra'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'countries' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Andorra' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'AD' );
                    countryId = result.id;
                    done();
                });
        });

        it('should return empty obj on a non-existant country', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {name: 'asasasasa'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.empty;
                    done();
                });
        });

        it('should give us a state by name', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {name: 'Connecticut'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'statesUSA' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Connecticut' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'CT' );
                    stateId = result.id;
                    done();
                });
        });

        it('should give us a province by name', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {name: 'Prince Edward Island'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'provincesCanada' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Prince Edward Island' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'PE' );
                    provinceId = result.id;
                    done();
                });
        });

        it('should give us a country by id', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {id: countryId} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'countries' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Andorra' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'AD' );

                    done();
                });
        });

        it('should give us a state by id', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( { id: stateId } )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'statesUSA' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Connecticut' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'CT' );

                    done();
                });
        });

        it('should give us a state by id', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( { id: provinceId } )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'provincesCanada' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Prince Edward Island' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'PE' );

                    done();
                });
        });

        it('should return empty obj on a non-existant id', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {id: 121212121212} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.empty;

                    done();
                });
        });

        it('should give us a country by code', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {countryCode: 'AQ'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'countries' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Antarctica' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'AQ' );

                    done();
                });
        });

        it('should return empty obj on a non-existant country code', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {countryCode: 'ZZZ'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.empty;

                    done();
                });
        });

        it('should give us a state by code', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {stateCode: 'DE'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'statesUSA' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Delaware' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'DE' );

                    done();
                });
        });

        it('should return empty obj on a non-existant state code', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {stateCode: 'ZZZ'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.empty;

                    done();
                });
        });

        it('should give us a province by code', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {provinceCode: 'SK'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;
                    expect( result ).to.be.an ( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'category' ).and.equal ( 'provincesCanada' );
                    expect( result ).to.have.property( 'name' ).and.equal ( 'Saskatchewan' );
                    expect( result ).to.have.property( 'code' ).and.equal ( 'SK' );

                    done();
                });
        });

        it('should return empty obj on a non-existant province code', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {provinceCode: 'ZZZ'} )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.empty;

                    done();
                });
        });

        it('should give us a err if insufficient data', function( done ) {
            var req = request( app ).post( '/countries' );
            req.set( 'Accept','application/json' )
                .send ( {} )
                .expect( 'Content-Type', /json/ )
                .expect( 400 )
                .end(function (err, res) {
                    var result = res.body;

                    expect( result ).to.be.an ( 'string' );

                    done();
                });
        });

    });

});
