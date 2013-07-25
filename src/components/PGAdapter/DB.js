var Query = require('./PostgresQuery'),
  Transaction = require('./PostgresTransaction');


function DB(configs) {
  this.configs = configs;
}


/**
 * Returns transaction object that can accept multiple
 * queries, exposes rollback and commit methods.
 * 
 * @return {Transaction} Transaction handler
 */
DB.prototype.startTransaction = function() {
  return new Transaction(this.configs);
};


/**
 * Generic query, passes arguments down to pg.client.query eventually
 * 
 * @return {promise}
 */
DB.prototype.query = function() {
  var newQuery = new Query(this.configs);
  return newQuery.create.apply(newQuery, arguments);
};


module.exports = DB;