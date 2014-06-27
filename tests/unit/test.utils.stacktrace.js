'use strict';

// Bootstrap the testing environmen
var stacktrace = require('utils').stacktrace
  , expect     = require( 'chai' ).expect;

describe('utils', function() {
    describe('.stacktrace()', function() {
        it('should return array', function() {
            expect( stacktrace() ).to.be.an.instanceOf( Array );
        });

        it('should return stack stace beginning at current function', function() {
            function helloMyFilez() {
                var stack = stacktrace()
                expect( stack[ 0 ] ).to.include( 'helloMyFilez' );
            }
            helloMyFilez();
        });

        it('should contain function names and filepaths', function() {
            function helloMyFilez1() {
                helloMyFilez2();
            }

            function helloMyFilez2() {
                var stack = stacktrace();
                expect( stack[ 0 ] ).to.include( 'helloMyFilez2' );
                expect( stack[ 0 ] ).to.include( 'test.utils.stacktrace.js' );
                expect( stack[ 1 ] ).to.include( 'helloMyFilez1' );
                expect( stack[ 1 ] ).to.include( 'test.utils.stacktrace.js' );
            }

            helloMyFilez1();
        });
    });
});
