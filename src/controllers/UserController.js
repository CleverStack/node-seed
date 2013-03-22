/**
 * I am not sure it's appropriate to be calling these things "controllers"
 * since I also keep middleware in here. It's a terminology issue mostly.
 * To see the middleware in action check out the routes.js definition script
 *
 * @author Mason Houtz <mason@clevertech.biz>
 */


var User = require('../model/User');

module.exports = function(Service) {

	return {

		list: function(req, res) {

			Service.getAll()
				.then(function(users) {
					res.send(200, users.map(User.export));
				})
				.fail(function(err) {
					res.send(400, err);
				});

		},

		get: function(req, res) {

			var id = req.params.id;

			Service.getById(id)
				.then(function(user) {
					res.send(200, user.export());
				})
				.fail(function(err) {
					res.send(400, err);
				});
		},

		save: function(req, res) {

			var user = req.user;

			Service.save(user)
				.then(function(user) {
					res.json(200, user.export());
				}).fail(function(err) {
					res.send(500, err.toString());
				});
		},



		// middleware that assembles a User model from request inputs
		
		hydrate: function(req, res, next) {
			req.user = User.hydrate(req.body);
			next();
		}


	};

};