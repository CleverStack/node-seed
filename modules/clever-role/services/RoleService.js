var BaseService = require( './BaseService' )
  , Q = require( 'q' )
  , _ = require( 'lodash' )
  , RoleService = null;

module.exports = function ( db, Role, Permission, User ) {
    if ( RoleService && RoleService.instance ) {
        return RoleService.instance;
    }

    RoleService = BaseService.extend( {

        listRolesWithPerm: function ( accId, roleId ) {
            var deferred = Q.defer(),
                service = this;

            if ( !!roleId ) {
                roleId = parseInt( roleId, 10 );
            }

            var sql = 'select t1.id, t1.name, t1.description, t3.id as permid, t3.action, t3.description as perm_description '
                + 'from Roles t1'
                + ' left join PermissionsRoles t2 on t1.id = t2.RoleId'
                + ' left join Permissions t3 on t2.PermissionId = t3.id'
                + ' where t1.AccountId = ' + accId
                + (!!roleId && !isNaN( roleId ) ? ' AND t1.id = ' + roleId : '')
                + ' ;';

            this.query( sql )
                .success( function ( roles ) {
                    if ( !roles ) {
                        return deferred.resolve( !!roleId ? {} : [] )
                    }

                    service.getRoleCounts( !!roleId ? roles[0] : roles, accId )
                        .then( deferred.resolve )
                        .fail( deferred.reject );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        getRoleCounts: function ( roles, accId, roleIds ) {
            var deferred = Q.defer()
              , service = this
              , roles = Array.isArray( roles ) ? roles : [roles]
              , _where =
                {
                    AccountId: accId,
                    RoleId: _.uniq( roles.map( function ( r ) {
                        return r.id;
                    } ) )
                };

            User.all( {attributes: ['RoleId', ['count(id)', 'count']], where: _where, group: 'RoleId'} )
                .success( function ( counts ) {
                    if ( !counts || !counts.length ) {
                        return deferred.resolve( service.groupRolePermissions( roles ) );
                    }

                    var _roles = service.groupRolePermissions( roles );
                    counts.forEach( function ( c ) {
                        var idx = _.findIndex( _roles, function ( r ) {
                            return r.id === c.RoleId;
                        } );

                        _roles[idx].count = idx > -1 ? c.count : 0;
                    } );

                    deferred.resolve( _roles );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        assignRole: function ( accId, userIds, removed, role ) {
            var deferred = Q.defer()
              , actions = [];

            role = _.isArray( role ) ? role[0] : role;

            if ( !role || !role.id ) {
                deferred.resolve( {statuscode: 404, message: 'Role not found.'} );
            } else {
                if ( !userIds || !Array.isArray( userIds ) || !userIds.length ) {
                    actions.push( User.update( ['RoleId IS NULL'], {RoleId: role.id} ) );
                } else {
                    actions.push( User.update( {RoleId: role.id}, {AccountId: accId, id: userIds} ) );
                }

                if ( Array.isArray( removed ) && removed.length ) {
                    actions.push( User.update( {RoleId: null}, {AccountId: accId, id: removed, RoleId: role.id} ) );
                }

                Q.all( actions ).then( deferred.resolve ).fail( deferred.reject );
            }

            return deferred.promise;
        },

        hasRoles: function ( req, roles, booleanLogic ) {
            roles = Array.isArray( roles ) ? roles : [roles];
            booleanLogic = booleanLogic === "any" ? 'any' : 'all';

            var isAuthed = req.isAuthenticated() && req.session.passport.user.role
              , booleanCount = 0;

            roles.forEach( function ( role ) {
                if ( isAuthed && ~req.session.passport.user.role.name.indexOf( roleName ) ) {
                    ++booleanCount;
                }
            } );

            return (booleanLogic === "any" && booleanCount > 0) || (booleanLogic === "all" && booleanCount === roles.length);
        },

        createRoleWithPermissions: function ( data, accId ) {
            var deferred = Q.defer()
              , service = this;

            service
                .saveNewRole( data, accId )
                .then( function ( role ) {
                    return service.saveRolePermissions( role, data['permissions'] );
                } )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        saveNewRole: function ( data, accId ) {
            var deferred = Q.defer();

            var roledata = {
                name: data['name'],
                description: (data['description']) ? data['description'] : null,
                AccountId: accId
            };

            Role
                .create( roledata )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        },

        saveRolePermissions: function ( role, permIds ) {
            var deferred = Q.defer()
              , permissions = [];


            if ( !permIds || !permIds.length ) {

                deferred.resolve( { id: role.id, name: role.name, permissions: permissions } );

            } else {
                permissions = permIds.map( function ( p ) {
                    return Permission.build( { id: p } )
                } );

                role
                    .setPermissions( permissions )
                    .success(function ( savedperms ) {
                        deferred.resolve( {
                            id: role.id,
                            name: role.name,
                            permissions: savedperms.map( function ( x ) {
                                return x.id
                            } )
                        } );

                    } ).error( deferred.reject );
            }

            return deferred.promise;
        },

        updateRoleWithPermissions: function ( data, accId ) {
            var deferred = Q.defer()
              , service = this;


            Role.find( data.id )
                .success( function ( role ) {
                    if ( role[ 'AccountId' ] != accId ) {
                        deferred.resolve( { statuscode: 403, message: "unauthorized" } );
                        return;
                    }

                    service
                        .updateRole( role, data )
                        .then( service.removePermissions.bind( service ) )
                        .then( function ( updatedrole ) {
                            return service.saveRolePermissions( updatedrole, data['permissions'] );
                        } )
                        .then( deferred.resolve )
                        .fail( deferred.reject );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        updateRole: function ( role, data ) {
            var deferred = Q.defer();

            var roledata = {
                name: data['name'],
                description: (data['description']) ? data['description'] : null
            };

            role
                .updateAttributes( roledata )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        },

        removeRoleWithPermissions: function ( accId, id ) {
            var deferred = Q.defer()
              , service = this;


            Role.find( id )
                .success( function ( role ) {
                    if ( !role || role[ 'AccountId' ] != accId ) {
                        deferred.resolve( { statuscode: 403, message: "unauthorized" } );
                        return;
                    }

                    service
                        .removeRole( role )
                        .then( function ( status ) {
                            if ( !!status && !!status.statuscode ) {
                                console.log( 'dafuq?' );
                                return deferred.resolve( status );
                            }

                            service.removePermissions( role ).then( function () {
                                deferred.resolve( {statuscode: 200, message: 'role has been removed'} );
                            }, deferred.reject );
                        } )
                        .fail( deferred.reject );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        removeRole: function ( role ) {
            var deferred = Q.defer()
              , service = this
              , systemRoles = ['Owner', 'Super Admin', 'HR Manager', 'HR Assistant', 'General User', 'Recruiter'];

            if ( ~systemRoles.indexOf( role.name ) ) {
                deferred.resolve( {statuscode: 403, message: 'unauthorized' } );
            } else {
                role.destroy()
                    .success( function () {
                        User.update( {RoleId: 7}, {AccountId: role.AccountId, RoleId: role.id } )
                            .success( deferred.resolve )
                            .error( deferred.reject );
                    } )
                    .error( deferred.reject );
            }

            return deferred.promise;
        },

        removePermissions: function ( role ) {
            var deferred = Q.defer();

            var sql = 'delete from PermissionsRoles where RoleId = ' + role.id
                + ' ;';

            this.query( sql )
                .success( function ( result ) {
                    deferred.resolve( role );
                } )
                .error( deferred.reject );

            /*
             I am having the following issue during updates, with the code below
             https://github.com/sequelize/sequelize/issues/739,

             */

            // role
            // .setPermissions([])
            // .success( function( perms ){
            //     deferred.resolve( role );
            // })
            // .error( deferred.reject );

            return deferred.promise;
        },

        groupRolePermissions: function ( roles ) {
            var arr = []
              , grp = {};

            while ( i = roles.pop() ) {
                if ( !grp[ i.id ] ) {
                    grp[ i.id ] = {
                        id: i.id,
                        "name": i.name,
                        "description": i.description,
                        "permissions": []
                    }
                }

                if ( i.permid && i.action ) {
                    grp[ i.id ].permissions.push( { permId: i.permid, action: i.action, description: i.perm_description } );
                }
            }

            Object.keys( grp ).forEach( function ( key ) {
                arr.push( grp[key] );
            } );

            return arr;
        }

    } );

    RoleService.instance = new RoleService( db );
    RoleService.Model = Role;

    return RoleService.instance;
};
