var time = require('time'),
    moment = require('moment');

module.exports = function (date, timezone) {
    var local = new time.Date(date);
    local.setTimezone(timezone);
    var tzm = moment.utc(local).add('minutes', -local.getTimezoneOffset());

    var valueOf = tzm.valueOf.bind(tzm);
    tzm.valueOf = function () {
        return valueOf() + local.getTimezoneOffset() * 60 * 1000;
    };

    tzm.toDate = function () {
        return new Date(this.valueOf());
    };

    tzm.toString = function () {
        return this.format('YYYY-MM-DD HH:mm:ss') + ' ('+timezone+')';
    };
    
    tzm.clone = function () {
        return module.exports(this.valueOf(), timezone);
    };

    return tzm;
};