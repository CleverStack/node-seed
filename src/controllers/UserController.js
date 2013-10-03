var crypto = require('crypto')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

module.exports = function( UserService ) {

    passport.serializeUser(function ( user, done ) {
        done(null, user.id);
    });

    passport.deserializeUser(function ( id, done ) {
        UserService.findById(id)
            .then(done.bind(null, null))
            .fail(done);
    });

    passport.use(new LocalStrategy(function ( username, password, done ) {
        var credentials = {
            username: username,
            password: crypto.createHash('sha1').update(password).digest('hex')
        };

        UserService.authenticate(credentials)
            .then(done.bind(null, null))
            .fail(done);
    }));

    return (require('classes').Controller).extend(
        {
            service: UserService,

            requiresLogin: function( req, res, next ) {
                if (!req.isAuthenticated())
                    return res.send(401);
                next();
            },

            requiresRole: function( roleName ) {
                return function( req, res, next ) {
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
                var self = this;
                var data = self.req.body;
                if (data.id) {
                    return self.putAction();
                }

                if (data.password) {
                    data.password = crypto.createHash('sha1').update(data.password).digest('hex');
                }

                UserService
                    .create(data)
                    .then(this.proxy('send'))
                    .fail(self.proxy('handleException'));
            },

            putAction: function() {
                var user = this.req.user;
                var data = this.req.body;
                if ( data.password ) {
                    data.password = crypto.createHash('sha1').update(data.password).digest('hex');
                }

                if ( data.new_password ) {
                    UserService.find({
                        where: {
                            id: data.id,
                            password: data.password
                        }
                    })
                        .then( this.proxy( 'handleUpdatePassword', data.new_password ) )
                        .fail( this.proxy( 'handleException' ) );
                } else {
                    UserService
                        .update(user, data)
                        .then(this.proxy('send'))
                        .fail(this.proxy('handleException'));
                }
            },

            handleUpdatePassword: function( newPassword, user ) {
                if ( user.length ) {
                    user = user[0];
                    user.updateAttributes({
                        password: crypto.createHash('sha1').update(newPassword).digest('hex')
                    }).success(function ( user ) {
                            this.send({status: 200, results: user});
                        }.bind(this)
                        ).fail(this.proxy('handleException'));
                } else {
                    this.send({status: 500, error: "Incorrect old password!"});
                }
            },

            loginAction: function() {
                passport.authenticate('local', this.proxy('handleLocalUser'))(this.req, this.res, this.next);
            },

            handleLocalUser: function ( err, user ) {
                if (err) return this.handleException(err);
                if (!user) return this.send(403);
                this.loginUserJson(user);
            },

            loginUserJson: function ( user ) {
                this.req.login(user, this.proxy('handleLoginJson', user));
            },

            handleLoginJson: function ( user, err ) {
                if (err) return this.handleException(err);
                this.send(user);
            },

            currentAction: function () {
                var user = this.req.user;
                if (!user) {
                    return this.send({});
                }
                this.send(user);
            },

            authorizedUser: function( user ) {
                console.dir(user);
                if ( user ) {
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
