var RoleService = null
  , Q = require('q')
  , _ = require('lodash')
  , configSysRoles = require( 'config' )[ 'clever-system-role' ];

module.exports = function( sequelize, ORMRoleModel, ORMPermissionModel, ORMUserModel ) {

    if (RoleService && RoleService.instance) {
        return RoleService.instance;
    }

    RoleService = require( 'services' ).BaseService.extend( {

        listRolesWithPerm : function( accId, roleId ){
            var deferred = Q.defer()
              , service = this;

            if (!!roleId) {
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
            .success( function( roles ){
                if( !roles ) { return deferred.resolve( !!roleId ? {} : [] ) }

                service.getRoleCounts( !!roleId ? roles[0] : roles, accId )
                    .then( deferred.resolve )
                    .fail( deferred.reject );
            })
            .error( deferred.reject );

            return deferred.promise;
        },

        getRoleCounts: function ( roles, accId ) {
            var deferred = Q.defer()
              , service = this
              , roles = Array.isArray( roles ) ? roles : [ roles ]
              , _where = {
                    AccountId: accId,
                    RoleId: _.uniq( roles.map( function ( r ) {
                        return r.id;
                    } ) )
                };

            ORMUserModel.all( {attributes: ['RoleId', ['count(id)', 'count']], where: _where, group: 'RoleId'} )
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
              , promise = []
              , _set = {}
              , _where = {};

            role = Array.isArray( role ) ? role[0] : role;

            if ( !role || !role.id ) {
                deferred.resolve( {statuscode: 404, message: 'Role not found.'} );
            } else {
                if ( !userIds || !Array.isArray( userIds ) || !userIds.length ) {
                    _set = {RoleId: null};
                    _where = {RoleId: role.id};
                } else if ( Array.isArray( removed ) && removed.length ){
                    _set = {RoleId: null};
                    _where = {AccountId: accId, id: removed, RoleId: role.id};
                } else {
                    _set = {RoleId: role.id};
                    _where = {AccountId: accId, id: userIds};
                }

                ORMUserModel
                    .findAll( {where: _where } )
                    .success( function ( users ) {

                        if ( !!users && !!users.length ) {
                            users.forEach( function ( user ) {
                                promise.push( user.updateAttributes( _set ) )
                            } );

                            Q.all( promise )
                                .then( deferred.resolve )
                                .fail( deferred.reject );

                        } else {
                            deferred.resolve();
                        }
                    } )
                    .error( deferred.reject );
            }

            return deferred.promise;
        },

        hasRole: function ( req, roles ) {

            roles = Array.isArray( roles ) ? roles : [roles];

            var isAuthed = req.isAuthenticated() && !!req.user && !!req.user.role
              , hasRole = false;

            roles.forEach( function ( role ) {
                if ( isAuthed && role === req.user.role.name ) {
                    hasRole = true;
                }
            } );

            return hasRole;
        },

        createRoleWithPermissions: function ( data, accId ) {
            var deferred = Q.defer()
              , service = this;

            service
                .saveNewRole( data, accId )
                .then( function ( role ) {
                    return service.saveRolePermissions( role, data['permIds'] );
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

            ORMRoleModel
                .create( roledata )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        },

        saveRolePermissions: function ( role, permIds ) {
            var deferred = Q.defer()
              , permissions = [];

            if ( !permIds || !permIds.length ) {
                deferred.resolve( {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    AccountId: role.AccountId,
                    permissions: permissions
                } );

            } else {
                permissions = permIds.map( function ( p ) {
                    return ORMPermissionModel.build( { id: p } )
                } );

                role
                    .setPermissions( permissions )
                    .success( function ( savedperms ) {
                        deferred.resolve( {
                            id: role.id,
                            name: role.name,
                            description: role.description,
                            AccountId: role.AccountId,
                            permissions: savedperms.map( function ( x ) { return x.id } )
                        } );

                    } )
                    .error( deferred.reject );
            }

            return deferred.promise;
        },

        updateRoleWithPermissions: function ( data, accId ) {
            var deferred = Q.defer()
              , service = this;


            ORMRoleModel.find( data.id )
                .success( function ( role ) {

                    if ( role.AccountId !== accId ) {
                        deferred.resolve( { statuscode: 403, message: "unauthorized" } );
                        return;
                    }

                    service
                        .updateRole( role, data )
                        .then( service.removePermissions.bind( service ) )
                        .then( function ( updatedrole ) {
                            return service.saveRolePermissions( updatedrole, data['permIds'] );
                        } )
                        .then( deferred.resolve )
                        .fail( deferred.reject );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        updateRole: function ( role, data ) {
            var deferred = Q.defer();

            var roleData = {
                name: data['name']
            };

            if ( !!data['description'] ) {
                roleData.description = data['description'];
            }

            role
                .updateAttributes( roleData )
                .success( deferred.resolve )
                .error( deferred.reject );

            return deferred.promise;
        },

        removeRoleWithPermissions: function ( accId, id ) {
            var deferred = Q.defer()
              , service = this;


            ORMRoleModel.find( id )
                .success( function ( role ) {
                    if ( !role || role[ 'AccountId' ] !== accId ) {
                        deferred.resolve( { statuscode: 403, message: "unauthorized" } );
                        return;
                    }

                    service
                        .removeRole( role )
                        .then( function ( status ) {
                            if ( !!status && !!status.statuscode ) {
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
              , systemRoles = configSysRoles
              , defaultRole = systemRoles[ systemRoles.length - 1 ]
              , promise = [];

            if ( systemRoles.indexOf( role.name ) >= 0 ) {
                deferred.resolve( {statuscode: 403, message: 'unauthorized' } );
            } else {
                role.destroy()
                    .success( function () {
                        ORMRoleModel
                            .find( { where: { name: defaultRole } } )
                            .success( function ( defRole ) {
                                ORMUserModel
                                    .findAll( {where: {AccountId: role.AccountId, RoleId: role.id } } )
                                    .success( function ( users ) {

                                        if ( !!users && !!users.length ) {
                                            users.forEach( function ( user ) {
                                                promise.push( user.updateAttributes( { RoleId: defRole.id } ) )
                                            } );

                                            Q.all( promise )
                                                .then( deferred.resolve )
                                                .fail( deferred.reject );

                                        } else {
                                            deferred.resolve();
                                        }
                                    } )
                                    .error( deferred.reject );
                            } )
                            .error( deferred.reject );

                    } )
                    .error( deferred.reject );
            }

            return deferred.promise;
        },

        removePermissions: function ( role ) {
            var deferred = Q.defer();

            var sql = 'delete from PermissionsRoles where RoleId = ' + role.id + ' ;';

            this.query( sql )
                .success( function ( result ) {
                    role
                        .setPermissions( [] )
                        .success( function ( perms ) {
                            deferred.resolve( role );
                        } )
                        .error( deferred.reject );
                } )
                .error( deferred.reject );

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

    RoleService.instance = new RoleService( sequelize );
    RoleService.Model = ORMRoleModel;

    return RoleService.instance;
};
