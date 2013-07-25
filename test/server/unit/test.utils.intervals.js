var should = require('should'),
    intervals = require('../../../src/utils').intervals;

describe('utils.intervals', function () {
    describe('.sort(set)', function () {
        it('should sort intervals by start time', function () {
            var sorted = [
                {
                    start: new Date(2013, 01, 01),
                    end: new Date(2013, 01, 02)
                },
                {
                    start: new Date(2013, 01, 04),
                    end: new Date(2013, 01, 05)
                },
                {
                    start: new Date(2013, 01, 08),
                    end: new Date(2013, 01, 09)
                },
                {
                    start: new Date(2013, 01, 12),
                    end: new Date(2013, 01, 13)
                }
            ];

            var unsorted = [sorted[3], sorted[0], sorted[1], sorted[2]];

            intervals.sort(unsorted).should.eql(sorted);
        });
    });

    describe('.intersect(set1, set2)', function () {
        it('should return true if two sets have intersecting intervals', function () {
            var set1 = [
                {
                    start: new Date(2013, 01, 1),
                    end:   new Date(2013, 01, 15)
                },
                {
                    start: new Date(2013, 01, 18),
                    end:   new Date(2013, 01, 20)
                }
            ];

            var set2 = [
                {
                    start: new Date(2013, 01, 14),
                    end:   new Date(2013, 01, 16)
                }
            ];

            var set3 = [
                {
                    start: new Date(2013, 01, 2),
                    end:   new Date(2013, 01, 3)
                }
            ];

            var set4 = [
                {
                    start: new Date(2013, 01, 16),
                    end:   new Date(2013, 01, 19)
                }
            ];

            var set5 = [
                {
                    start: new Date(2013, 01, 16),
                    end:   new Date(2013, 01, 30)
                }
            ];

            intervals.intersect(set1, set2).should.be.true;
            intervals.intersect(set1, set3).should.be.true;
            intervals.intersect(set1, set4).should.be.true;
            intervals.intersect(set1, set5).should.be.true;
        });

        it('should return false otherwise', function () {
            var set1 = [
                {
                    start: new Date(2013, 01, 1),
                    end:   new Date(2013, 01, 15)
                },
                {
                    start: new Date(2013, 01, 18),
                    end:   new Date(2013, 01, 20)
                }
            ];

            var set2 = [
                {
                    start: new Date(2013, 01, 16),
                    end:   new Date(2013, 01, 17)
                }
            ];
            
            var set3 = [];

            var set4 = [
                {
                    start: new Date(2013, 02, 16),
                    end:   new Date(2013, 02, 17)
                }
            ];

            intervals.intersect(set1, set2).should.be.false;
            intervals.intersect(set1, set3).should.be.false;
            intervals.intersect(set1, set4).should.be.false;
        });

        it('should return false if dates adjoin', function () {
            var set1 = [
                {
                    start: new Date(2013, 01, 1),
                    end:   new Date(2013, 01, 15)
                },
                {
                    start: new Date(2013, 01, 18),
                    end:   new Date(2013, 01, 20)
                }
            ];

            var set2 = [
                {
                    start: new Date(2013, 01, 15),
                    end:   new Date(2013, 01, 18)
                }
            ];

            intervals.intersect(set1, set2).should.be.false;
        });
    });

    describe('.substract(minuend, subtrahend)', function () {
        it('should return minuend intervals without subtrahend', function () {
            var minuend = [
                {
                    start: new Date(2013, 01, 3),
                    end:   new Date(2013, 01, 15)
                },
                {
                    start: new Date(2013, 01, 18),
                    end:   new Date(2013, 01, 20)
                },
                {
                    start: new Date(2013, 02, 3),
                    end:   new Date(2013, 02, 4)
                },
                {
                    start: new Date(2013, 02, 8),
                    end:   new Date(2013, 02, 9)
                }
            ];
            
            var subtrahend = [
                {
                    start: new Date(2013, 01, 1),
                    end:   new Date(2013, 01, 4)
                },
                {
                    start: new Date(2013, 01, 8),
                    end:   new Date(2013, 01, 10)
                },
                {
                    start: new Date(2013, 01, 14),
                    end:   new Date(2013, 01, 16)
                },
                {
                    start: new Date(2013, 01, 17),
                    end:   new Date(2013, 01, 18)
                },
                {
                    start: new Date(2013, 02, 1),
                    end:   new Date(2013, 02, 5)
                },
                {
                    start: new Date(2013, 02, 8),
                    end:   new Date(2013, 02, 9)
                }
            ];

            var difference = [
                {
                    start: new Date(2013, 01, 4),
                    end:   new Date(2013, 01, 8)
                },
                {
                    start: new Date(2013, 01, 10),
                    end:   new Date(2013, 01, 14)
                },
                {
                    start: new Date(2013, 01, 18),
                    end:   new Date(2013, 01, 20)
                }
            ];

            intervals.substract(minuend, subtrahend).should.eql(difference);
        });
    });
});
