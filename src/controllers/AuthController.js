/**
 * Auth or Login controller actions and associated
 * middleware. Not sure if it's really appropriate to
 * call this a controller.
 *
 * @author Mason Houtz
 */

var Credentials = require('../model/Credentials');

module.exports = function(AuthService) {

	return {


		login: function(req, res) {

			// I usually do this in case it gets
			// more complicated later.
			var creds = new Credentials(req.body);

			// authenticate then authorize
			AuthService.authenticate(creds)

				// did we get somebody
				.then(function(user) {
					return (user === null) ? res.send(403) : user;
				})

				// authorize that guy
				.then(function(authenticatedUser) {
					return AuthService.authorize(authenticatedUser);
				})

				// log in
				.then(function(authorizedUser) {
					req.session.user = authorizedUser.export();
					res.send(200);	
				})

				// something went foul
				.fail(function(err) {
					console.log('err', err);
					res.send(500, err.toString());
				});

		},


		logout: function(req, res) {
			req.session.user = null;
			res.send(200);
		},



		// authentication and authorization middleware

		requiresLogin: function(req, res, next) {
			if (!req.session.user)
				return res.send(401);
			next();
		},

		requiresRole: function(roleName) {
			return function(req, res, next) {
				if (!req.session.user ||
					!req.session.user.roles ||
					req.session.user.roles.indexOf(roleName) === -1)
					return res.send(401);
				next();
			};
		}
		
		
	};

};

