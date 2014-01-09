'use strict';

var stacktrace = require ( 'utils' ).stacktrace
  , expect = require ( 'chai' ).expect;

describe ( 'utils', function () {
    describe ( '.stacktrace()', function () {
        it ( 'should return array', function () {
            var stack = stacktrace ();
            expect ( stack ).to.be.a ( 'array' );
        } );

        it ( 'should return stack stace beginning at current function', function () {
            function helloMyFilez () {
                var stack = stacktrace ();
                expect ( stack[0] ).to.contain ( 'helloMyFilez' );
            }

            helloMyFilez ();
        } );

        it ( 'should contain function names and filepaths', function () {
            function helloMyFilez1 () {
                helloMyFilez2 ();
            }

            function helloMyFilez2 () {
                var stack = stacktrace ();
                expect ( stack[0] ).to.contain ( 'helloMyFilez2' );
                expect ( stack[0] ).to.contain ( 'server', 'unit', 'test.utils.stacktrace.js' );
                expect ( stack[1] ).to.contain ( 'helloMyFilez1' );
                expect ( stack[1] ).to.contain ( 'server', 'unit', 'test.utils.stacktrace.js' );
            }

            helloMyFilez1 ();
        } );
    } );
} );
