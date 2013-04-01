module.exports = (require('./../classes/Controller.js')).extend(
/* @Static */
{
	// ... section to place static items, async.queue()'s for instance
},
/* @Prototype */
{
	/**
	 * 'POST /example'
	 */
	postAction: function() {
		this.response.json({
			status: 'Created record!' 
		});
	},

	/**
	 * 'GET /example' (It is possible to not be an index, but a list) or 'GET /example/12' or 'GET /example/get/12'
	 */
	getAction: function() {
		if (this.request.params.id) {
			this.response.json({
				status: 'sending you record with id of ' + this.request.params.id
			});
		} else {
			this.response.json({
				status: 'Sending you the list of examples.'
			});
		}
	},

	/**
	 * 'PUT /example/12'
	 */
	putAction: function() {
		this.response.json({
			status: 'updated record with id ' + this.request.params.id
		});
	},

	/**
	 * 'DELETE /example/12' or 'GET /example/delete/12'
	 */
	deleteAction: function() {
		this.response.json({
			status: 'deleted record with id ' + this.request.params.id
		});
	},

	/**
	 * 'GET/PUT/POST/DELETE /example/custom'
	 */
	customAction: function() {
		this.response.json({
			status: 'inside custom action'
		});
	},

	/**
	 * This function can never be called because it does not have 'Action' on the end of it
	 */
	hidden: function() {
		console.log('Hidden function called');
		process.exit();
	}
});