var Class = require('uberclass')
  , Q = require('q');

module.exports = Class.extend(
/* @Static */
{
	instance: null
},
/* @Prototype */
{
	db:null,

	setup: function(dbAdapter) {
		this.db = dbAdapter;
	},

	startTransaction: function() {
		return this.db.startTransaction();
	},

	rawQuery: function(sql) {
		console.log('Running SQL: ' + sql);
		return this.db.query(sql, null, { raw: true });
	},

	query: function(sql) {
		console.log('Running SQL: ' + sql);
		return this.db.query(sql);
	}
});