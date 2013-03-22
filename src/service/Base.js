/**
 * Simple base class for data services. Exposes query
 * and transaction methods to subclasses. Brian C tells
 * me some other guy wrote excellent wrappers for basic
 * queries and transactions, we can easily swap mine out
 * for his.
 *
 * The idea is that services always return promises so that
 * we can string service calls together and the controller can
 * append the final action.
 * 
 * The transaction method actually returns a transaction object
 * that itself creates promises. (It's a little dirty)
 */


function BaseService(dbAdapter) {
	this.db = dbAdapter;
}


/**
 * Returns transaction object that can accept multiple
 * queries, exposes rollback and commit methods.
 * 
 * @return {Transaction} Transaction handler
 */
BaseService.prototype.startTransaction = function() {
	return this.db.startTransaction();
};


/**
 * Generic query, passes arguments down to pg.client.query eventually
 * 
 * @return {promise}
 */
BaseService.prototype.query = function() {
	return this.db.query.apply(this.db, arguments);
};


module.exports = BaseService;
