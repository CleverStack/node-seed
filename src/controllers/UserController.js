var crypto = require('crypto');

module.exports = function(UserService, ReservationService, ClientService, TrainerModel) {
    return (require('./../classes/Controller.js')).extend(
    {
        service: UserService,

        requiresLogin: function(req, res, next) {
            if (!req.isAuthenticated())
                return res.send(401);
            next();
        },

        requiresRole: function(roleName) {
            return function(req, res, next) {
                if (!req.isAuthenticated() ||
                    !req.session.user.roles ||
                    req.session.user.roles.indexOf(roleName) === -1)
                    return res.send(401);
                next();
            };
        }
    },
    {
        postAction: function() {
            var data = this.req.body;

            if (data.password) {
                data.password = crypto.createHash('sha1').update(data.password).digest('hex');
            }

            UserService.create(data)
            .then(this.proxy('send'))
            .fail(this.proxy('handleException'));
        },

        putAction: function() {
            var data = this.req.body;

            if (data.password) {
                data.password = crypto.createHash('sha1').update(data.password).digest('hex');
            }

            UserService.update(this.req.params.id, data)
            .then(this.proxy('send'))
            .fail(this.proxy('handleException'));
        },

        loginAction: function() {
            var credentials = {
                username: this.req.body.username,
                password: crypto.createHash('sha1').update(this.req.body.password).digest('hex')
            }

            UserService.authenticate(credentials)
            .then(this.proxy('authorizedUser'))
            .fail(this.proxy('handleException'));
        },

        authorizedUser: function(user) {
            console.dir(user);
            if (user) {
                this.req.login(user);
                this.res.send(200); 
            } else {
                this.res.send(403);
            }
        },

        logoutAction: function() {
            this.req.logout();
            this.res.send(200);
        }
    });
};
