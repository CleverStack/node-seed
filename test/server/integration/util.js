var config = require('../../../config')
  , defineModels = require('../../../src/model')
  , Sequelize = require('sequelize')
  , Q = require('q');

var exec = require('child_process').exec
  , path = require('path');

exports.testEnv = function () {
    var deferred = Q.defer();

    var db = new Sequelize(
        config.testDb.database,
        config.testDb.username,
        config.testDb.password,
        config.testDb.options
    );

    var models = defineModels(db, config);


    db
    .sync({force:true})
    .success(function () {
        //Seed DataBase
        var seedCmd   = 'export NODE_ENV=local;export NODE_TEST=test;node ' +
                        path.resolve(__dirname + '/../../../bin/seedModels.js');

        exec(seedCmd,function(){
            console.log("********************* DB HAS BEEN REBASED AND SEEDED *********************");
            deferred.resolve();
        });

    })
    .error(deferred.reject);

    return deferred.promise;
};
