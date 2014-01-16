//module.exports = function ( app, RoleController, UserController, PermissionController ) {
module.exports = function ( app, RoleController, PermissionController ) {

//    app.get('/roles' ,                                                  UserController.requiresLogin, RoleController.attach());
//    app.post('/roles' ,             UserController.requiresAdminRights, UserController.requiresLogin, RoleController.attach());
//    app.post('/roles/:id/assign/?', UserController.requiresAdminRights, UserController.requiresLogin, RoleController.attach());
//    app.post('/roles/:id' ,         UserController.requiresAdminRights, UserController.requiresLogin, RoleController.attach());
//    app['delete']('/roles/:id' ,    UserController.requiresAdminRights, UserController.requiresLogin, RoleController.attach());
//
//    app.get('/permissions',                                             UserController.requiresLogin, PermissionController.attach());

    app.get('/roles' ,              RoleController.attach());
    app.post('/roles' ,             RoleController.attach());
    app.post('/roles/:id/assign/?', RoleController.attach());
    app.post('/roles/:id' ,         RoleController.attach());
    app['delete']('/roles/:id' ,    RoleController.attach());

    app.get('/permissions',         PermissionController.attach());
};