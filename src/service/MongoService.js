var BaseService = require('./BaseService')
    , Q = require('q');

module.exports = function(db, models) {
    var MongoService = BaseService.extend({

    });

    MongoService.Model = models.Mongo;
    return new MongoService(db);
};
