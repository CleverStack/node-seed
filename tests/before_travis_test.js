var Promise = require('bluebird')
  , spawn   = require('child_process').spawn
  , path    = require('path')
  , rimraf  = require('rimraf')
  , ncp     = require('ncp');

function installTestModule() {
  return new Promise(function(resolve, reject) {
    var source      = path.resolve(path.join(__dirname, 'unit', 'test-module'))
      , dest        = path.resolve(path.join(__dirname, '..', 'modules', 'test-module'));

    console.log('step #2 - install test-module - begin');

    rimraf(dest, function(e) {
      if (e === null) {
        ncp(source, dest, function(err) {
          if (err !== null) {
            console.log('Error in step #2 - ' + err + '\n');
            reject(e);
          } else {
            console.log('step #2 - completed');
            resolve();
          }
        });
      } else {
        console.log('Error in step #2 - ' + e + '\n');
        reject();
      }
    });

  });
}

function rebaseDb() {
  return new Promise(function(resolve, reject) {
    var proc = spawn('grunt', [ 'db' ], { cwd: path.resolve(path.join(__dirname, '..')) });

    console.log('step #3 - rebase db');

    proc.stdout.on('data', function(data) {
      console.log(data.toString());
    });

    proc.stderr.on('data', function(data) {
      console.log('Error in step #3 - ' + data.toString() + '\n');
      reject (data.toString());
    });

    proc.on('close', function(code) {
      console.log('step #3 process exited with code ' + code + '\n');
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}

function installORM() {
  return new Promise(function(resolve, reject) {
    var objs = [
        { reg: /What environment is this configuration for\?/, write: '\n', done: false },
        { reg: /Database username/ , write: 'travis\n'   , done: false },
        { reg: /Database password/ , write: '\n'         , done: false },
        { reg: /Database name/     , write: 'test_db\n'  , done: false },
        { reg: /Database dialect/  , write: 'mysql\n'    , done: false },
        { reg: /Database host/     , write: '127.0.0.1\n', done: false },
        { reg: /Database port/     , write: '3306\n'     , done: false },
      ]
      , proc = spawn ('clever', [ 'install', 'clever-orm' ], { cwd: path.resolve(path.join(__dirname, '..')) });

    console.log('step #1 - install clever-orm module - begin\n');

    proc.stdout.on('data', function (data) {
      var str = data.toString();

      if (str.match(/ing/) !== null) {
        console.log(str);
      }

      objs.forEach (function (obj, i) {
        if (obj.done !== true && str.match(obj.reg) !== null) {
          objs[i].done = true;
          proc.stdin.write(obj.write);
        }
      });
    });

    proc.stderr.on('data', function (data) {
      console.log('Error in step #1 - ' + data.toString() + '\n');
      reject (data.toString());
    });

    proc.on('close', function (code) {
      console.log('step #1 process exited with code ' + code + '\n');
      resolve();
    });
  });
}

installORM()
  .then(installTestModule)
  .then(rebaseDb)
  .catch(function (err) {
    console.log('Error - ' + err);
  });
