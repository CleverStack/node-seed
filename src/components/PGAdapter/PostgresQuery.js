var Q = require('q'),
	pg = require('pg');


function PostgresQuery(configs) {
	this.configs = configs;
}

PostgresQuery.prototype.create = function() {

	var deferred = Q.defer();
	var client = new pg.Client(this.configs);

	client.on('drain', function() {
		// console.log('client.drain');
		client.end();
	});

	client.on('error', function(err) {
		console.log('client.error', err);
		client.end();
		deferred.reject(err);
	});


	var query = client.query.apply(client, arguments);

	query.on('error', function(err) {

		console.log('----------------------------------------');
		console.log('query.error', err.toString());
		console.log('----------------------------------------');

		client.end();
	});

	query.on('row', function(row, result) {
		// console.log('query.row');
		result.addRow(row);
	});

	query.on('end', function(result) {
		// console.log('query.end');
		client.end();
		deferred.resolve(result);
	});

	client.connect();

	return deferred.promise;

};

module.exports = PostgresQuery;