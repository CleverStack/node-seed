var should = require('should'),
    time2minutes = require('../../../src/utils').time2minutes;

describe('utils.time2minutes', function () {
    it('should return number of minutes passed from 12:00 AM', function () {
        var times = [
            ['12:00 AM', 0],
            ['1:00 AM', 60],
            ['1:15 AM', 75],
            ['9:00 AM', 540],
            ['12:00 PM', 720],
            ['1:00 PM', 780],
            ['11:00 PM', 1380],
            ['11:59 PM', 1439]
        ];

        times.forEach(function (tnm) {
            var time = tnm[0],
                minutes = tnm[1];
            time2minutes(time).should.equal(minutes);
        });
    });

    it('should return NaN for invalid times', function () {
        var times = [
            '13:00 AM',
            '13:00 PM',
            '13:00',
            '13:',
            ':',
            ': ',
            '12:40 ',
            '12:40 AG',
            '12: AG'
        ];

        times.forEach(function (time) {
            time2minutes(time).should.be.nan;
        });
    });
});
