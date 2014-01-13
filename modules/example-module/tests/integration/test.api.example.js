var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' );

describe ( '/example', function () {
    describe ( 'POST /example', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .post ( '/example' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'Created record!'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'GET /example', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .get ( '/example' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'Sending you the list of examples.'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'GET /example/:id', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .get ( '/example/123' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'sending you record with id of 123'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'PUT /example/:id', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .put ( '/example/123' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'updated record with id 123'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'DELETE /example/:id', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .del ( '/example/123' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'deleted record with id 123'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'GET /example/custom', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .get ( '/example/custom' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        message: 'Hello from customAction inside ExampleController'
                    } );
                    done ();
                } );
        } );
    } );
});
