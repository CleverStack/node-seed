var BaseService = require( './BaseService' )
  , Q = require( 'q' )
  , PermissionService = null;

module.exports = function ( db, Permission, Role ) {
    if ( PermissionService && PermissionService.instance ) {
        return PermissionService.instance;
    }

    PermissionService = BaseService.extend( {
        list: function () {
            return Permission.all();
        },

        hasPermissions: function ( req, permissions, booleanLogic, fn ) {
            permissions = Array.isArray( permissions ) ? permissions : [permissions];

            if ( typeof booleanLogic === "function" ) {
                fn = booleanLogic;
                booleanLogic = 'all';
            }

            if ( !permissions.length ) {
                return fn( null, true );
            }

            booleanLogic = booleanLogic === "any" ? 'any' : 'all';

            var isAuthed = req.isAuthenticated() && req.user.role
              , booleanCount = 0;

            if ( !isAuthed ) {
                return fn( null, false );
            }

            if ( req.user && req.user.hasAdminRight === true ) {
                return fn( null, true );
            }

            Role.find( {
                where: {
                    id: req.user.role.id
                },
                include: [ Permission ]
            } )
                .success( function ( userPermissions ) {
                    if ( !userPermissions.permissions.length ) {
                        fn( null, false );
                    }

                    var permissionArray = userPermissions.permissions.map( function ( perm ) {
                        return perm.action;
                    } );

                    permissionArray.forEach( function ( perm ) {
                        if ( ~permissions.indexOf( perm ) ) {
                            ++booleanCount;
                        }
                    } );

                    fn( null, (booleanLogic === "any" && booleanCount > 0) || (booleanLogic === "all" && booleanCount === permissions.length) );
                } )
                .error( fn );
        }
    } );

    PermissionService.instance = new PermissionService( db );
    PermissionService.Model = Permission;

    return PermissionService.instance;
};
