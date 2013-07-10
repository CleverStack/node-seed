exports.time2minutes = function (time) {
    var parts1 = time.split(' ', 2);

    var firstHalf;
    if (parts1[1] == 'AM') {
        firstHalf = true;
    }
    else if (parts1[1] == 'PM') {
        firstHalf = false;
    }
    else {
        return NaN;
    }

    var parts2 = parts1[0].split(':', 2);

    var hour = parseInt(parts2[0]);
    var minute = parseInt(parts2[1]);

    if (hour > 12) return NaN;
    if (minute > 59) return NaN;

    if (hour == 12) hour = 0;

    var minutes = hour * 60 + minute;
    if (!firstHalf) {
        minutes += 12 * 60;
    }

    return minutes;
};

exports.minutes2time = function (minutes) {
    var hour = Math.floor(minutes / 60);
    var minute = minutes % 60;
    var ampm = 'AM';

    if (hour == 0) {
        hour = 12;
    } else if (hour == 12) {
        ampm = 'PM'
    } else if (hour > 12) {
        ampm = 'PM';
        hour -= 12;
    }

    if (minute < 10) {
        minute = '0'+minute;
    }

    return hour+':'+minute+' '+ampm;
};

exports.intervals = require('./intervals');
