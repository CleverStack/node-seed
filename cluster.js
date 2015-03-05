var os      = require('os')
  , path    = require('path')
  , chalk   = require('chalk')
  , cluster = require('cluster')
  , debug   = require('debug')(cluster.isMaster ? 'cleverstack:cluster' : 'cleverstack:app')
  , config  = require(path.resolve(path.join(__dirname, 'config')))
  , helpers = require(path.resolve(path.join(__dirname, 'lib', 'utils', 'helpers.js')));

// Clean and set the NODE_PATH for magic modules
process.env.NODE_PATH = helpers.nodePath();

debug('started with pid %s', chalk.yellow(process.pid));
debug('%s is "%s"', chalk.magenta('NODE_PATH'), chalk.yellow(process.env.NODE_PATH));

if (!cluster.isMaster) {
  
  // Worker Process, load app.js
  require(path.join(__dirname, 'app.js'));
} else {

  // Master Process, setup cluster
  debug('Loading %s hook files...', chalk.yellow('cluster.js'));
  helpers.loadModulesFileByName('cluster.js', config, cluster, debug);

  // Spawn new app process when a child dies
  cluster.on('exit', function(worker, code, signal) {
    debug('Worker %s has died with code %s and signal %s - Forking new process in 2.5 seconds...', worker.pid, code, signal);
    setTimeout(cluster.fork.bind(cluster), 2500);
  });

  // Spawn app processes
  for (var i = 0; i < (config.numChildren ? config.numChildren : os.cpus()); ++i) {
    cluster.fork();
  }
}
