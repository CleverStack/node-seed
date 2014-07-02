var cp      = require( 'child_process' )
  , cluster = require( 'cluster' )
  , _       = require( 'underscore' )
  , async   = require( 'async' )
  , path    = require( 'path' );

function masterMain (options, cb) {
    var module = options.module;
    var clientProcessCount = options.clientProcessCount;
    var serverProcessCount = options.serverProcessCount;
    var servers = [];

    _.times(serverProcessCount, function (idx) {
        var server = cluster.fork();
        servers.push( server );
        server.send({
            module: module
        });
    });

    async.times(clientProcessCount, function (idx, cb) {
        var client = cp.fork(__dirname + '/client');

        client.on('message', function (result) {
            cb(null, result);
        });

        client.on('exit', function () {
            console.log('Client exited');
        });
    }, finish);

    function finish (err, results) {
        servers.forEach( function( server ) {
            server.kill('SIGTERM');
        });
        cluster.disconnect(function () {
            if (err) {
                return cb && cb(err);
            }

            var result = results.reduce(function (sum, result) {
                return sum + result;
            }, 0) / results.length;

            cb(null, result);
        });
    }
}

function masterMainTwice (options, cb) {
    masterMain(options, function (err, avg1) {
        if (err) return cb && cb(err);

        masterMain(options, function (err, avg2) {
            if (err) return cb && cb(err);

            cb(null, (avg1+avg2)/2, avg1, avg2);
        });
    });
}

if (cluster.isMaster) {
    var jobs = [{
        name: 'clever-controller',
        module: '/index.js'
    }, {
        name: 'raw express.js',
        module: './server-express'
    }];

    var maxClientProcessCount = 1;
    var maxServerProcessCount = require('os').cpus().length;

    async.forEachSeries(jobs, function (job, cb) {
        async.timesSeries(maxClientProcessCount, function (clientIdx, cb) {
            async.timesSeries(maxServerProcessCount, function (serverIdx, cb) {
                var clientProcessCount = clientIdx + 1;
                var serverProcessCount = serverIdx + 1;

                masterMainTwice({
                    module: job.module,
                    clientProcessCount: clientProcessCount,
                    serverProcessCount: serverProcessCount
                }, function (err, avg, avg1, avg2) {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        var diff = Math.abs((1 / avg1) - (1 / avg2));
                        var flag = '';
                        if (diff > 100) {
                            flag = ' *';
                        }

                        console.log('%s: %d server, %d client processes: avg %d req/second (%d, %d)%s',
                            job.name,
                            serverProcessCount,
                            clientProcessCount,
                            Math.round(1 / avg),
                            Math.round(1 / avg1),
                            Math.round(1 / avg2),
                            flag);
                    }

                    cb();
                });
            }, cb);
        }, cb);

    }, function (err) {
        console.error(err);
    });
} else {
    process.on('message', function (msg) {
        if ( msg.module === '/index.js' ) {
            process.chdir( path.resolve( path.join( __dirname, '..', '..' ) ) );
            require( process.cwd() + msg.module );
        } else {
            require( msg.module );
        }
    });
}