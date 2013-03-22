/**
 * Postgres Transaction object
 * @author Mason Houtz <mason@clevertech.biz>
 */

var Q = require('q'),
	pg = require('pg');


function Transaction(configs) {

	var client = null;

	function deferQuery(queryConfig) {

		// console.log('deferQuery', queryConfig.text);

		var deferred = Q.defer();
			
		var query = client.query(queryConfig);

		query.on('error', function(err) {
			console.log('----------------------------------------');
			console.log('query.error', err.toString());
			console.log('query.error sql', queryConfig.text);
			console.log('query.error params', JSON.stringify(pqueryConfig.values));
			console.log('----------------------------------------');
			deferred.reject(err);
		});

		query.on('row', function(row, result) {
			result.addRow(row);
		});

		query.on('end', function(result) {
			// console.log('query.end', queryConfig.text);
			// console.log('query.end result', result.rows);
			deferred.resolve(result);
		});

		return deferred.promise;
	}


	function initClient() {
		console.log('initClient');
		client = new pg.Client(configs);
		client.connect();
	}

	function closeClient() {
		console.log("closeClient");
		client.end();
	}


	return {

		begin: function() {
			initClient();
			return this.query('begin');
		},

		// defer a query
		query: function(sql, params, name) {
			return deferQuery({
				text: sql,
				values: params || null,
				name: name || null
			});
		},

		commit: function() {
			console.log('commit');
			return this.query('commit')
				.then(closeClient);
		},

		rollback: function() {
			console.log('rollback');
			return this.query('rollback')
				.then(closeClient);
		}

	};

}

module.exports = Transaction;