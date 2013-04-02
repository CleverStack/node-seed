module.exports = function(UserService) {
	return (require('./../classes/Controller.js')).extend(
	/* @Static */
	{
		// ... section to place static items, async.queue()'s for instance
		// You can also omit this entire argument in the extend call
	},
	/* @Prototype */
	{
		/**
		 * This function only exists to show you calling the main controllers handleException() function, 
		 * you can use this as a hook to handle errors here in this controller before calling the main one
		 */
		handleException: function(exception) {
			this._super(exception);
		},

		/**
		 * 'POST /example'
		 */
		postAction: function() {
			this.send({
				status: 'Created record!' 
			});
		},

		/**
		 * 'GET /example' (It is possible to not be an index, but a list) or 'GET /example/12' or 'GET /example/get/12'
		 */
		getAction: function() {
			if (this.req.params.id) {
				this.send({
					status: 'sending you record with id of ' + this.req.params.id
				});
			} else {
				this.send({
					status: 'Sending you the list of examples.'
				});
			}
		},

		/**
		 * 'PUT /example/12'
		 */
		putAction: function() {
			this.send({
				status: 'updated record with id ' + this.req.params.id
			});
		},

		/**
		 * 'DELETE /example/12' or 'GET /example/delete/12'
		 */
		deleteAction: function() {
			this.send({
				status: 'deleted record with id ' + this.req.params.id
			});
		},

		/**
		 * 'GET/PUT/POST/DELETE /example/custom'
		 */
		customAction: function() {
			this.send({
				status: 'inside custom action'
			});
		},

		/**
		 * This function can never be called because it does not have 'Action' on the end of it
		 */
		hidden: function() {
			console.log('Hidden function called, this should be impossible');
			process.exit();
		}
	});
}