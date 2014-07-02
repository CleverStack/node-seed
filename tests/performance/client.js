var request = require('request'),
    async = require('async');

var requestCount = 10000;

var start = process.hrtime();

async.times(requestCount, function (idx, cb) {
    request('http://localhost:8080/example/custom', function (err, res, body) {
        if (err) {
            console.error(err);
            return;
        }

        cb();
    });
}, function (err) {
    //console.log('Client done');

    var elapsed = process.hrtime(start);
    elapsed = (elapsed[0] * 1e9 + elapsed[1]) / 1e9;

    process.send(elapsed / requestCount);
    process.exit();
});
