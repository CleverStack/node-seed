/*
 * Time interval functions.
 * 
 * WARNING: all functions require sorted sets
 */

var _ = require('underscore');

exports.sort = function (set) {
    return _.sortBy(set, function (interval) {
        return interval.start;
    });
};

exports.intersect = function (set1, set2) {
    var i1 = 0,
        i2 = 0;

    while (i1 < set1.length && i2 < set2.length) {
        var val1 = set1[i1],
            val2 = set2[i2];

        if (val1.start >= val2.end) {
            i2++;
            continue;
        }

        if (val2.start >= val1.end) {
            i1++;
            continue;
        }

        return true;
    }

    return false;
};

exports.substract = function (minuend, subtrahend) {
    var difference = [];

    var current = minuend[0];
    if (!current) {
        return difference;
    }

    var i1 = 0,
        i2 = 0;

    while (i1 < minuend.length && i2 < subtrahend.length) {
        var sub = subtrahend[i2];

        if (current.start >= sub.end) {
            i2++;
        }
        else if (sub.start > current.end) {
            difference.push(current);
            i1++;
            current = minuend[i1];
        }
        else if (current.start >= sub.start && current.end <= sub.end) {
            i1++;
            current = minuend[i1];
        }
        else if (current.start < sub.start && current.end <= sub.end) {
            difference.push({
                start: current.start,
                end: sub.start
            });
            i1++;
            current = minuend[i1];
        }
        else if (current.start >= sub.start && current.end > sub.end) {
            current = {
                start: sub.end,
                end: current.end
            };
            i2++;
        }
        else if (current.start < sub.start && current.end > sub.end) {
            difference.push({
                start: current.start,
                end: sub.start
            });
            current = {
                start: sub.end,
                end: current.end
            };
            i2++;
        }
    }

    return difference;
};
