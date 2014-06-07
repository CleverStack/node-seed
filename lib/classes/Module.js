var Class       = require( 'uberclass' )
  , path        = require( 'path' )
  , fs          = require( 'fs' )
  , injector    = require( 'injector' )
  , i           = require( 'i' )()
  , moduleDebug = require('debug')( 'Modules' )
  , config      = injector.getInstance( 'config' )
  , modules     = {}
  , Module;

Module = Class.extend(
{
    moduleFolders: [
        'exceptions',
        'classes',
        'models',
        'services',
        'controllers',
        'tasks'
    ],

    injectableFolders: [
        'models',
        'controllers',
        'services'
    ],

    excludedFiles: [
        'index.js',
        'module.js',
        'Gruntfile.js',
        'package.json'
    ]
},
{
    name: null,

    config: null,

    path: null,

    pkg: null,

    paths: null,

    setup: function( _name, _path, _pkg ) {
        // Set our module name
        this.name = _name;

        // Set our config if there is any
        this.config = typeof config[ _name ] === 'object'
            ? config[ _name ]
            : {};

        // Set the modules location
        this.path = _path;

        // Set the modules package.json
        this.pkg = _pkg;

        // Allow some code to be executed before the main setup
        this.hook( 'preSetup' );

        // Add the modules path to our list of paths
        this.paths = [ _path ];

        // Add our moduleFolders to the list of paths, and our injector paths
        this.Class.moduleFolders.forEach( this.proxy( 'addFolderToPath', injector ) );

        // Fire the preInit hook
        this.hook( 'preInit' );
    },

    hook: function( hookName ) {
        if ( typeof this[ hookName ] === 'function' ) {
            this.debug( 'calling ' + hookName + '() hook...' );

            // @TODO implement injector.injectSync() for use cases like this
            this[ hookName ]();
        }
    },

    addFolderToPath: function( injector, folder ) {
        var p = [ this.path, folder ].join( path.sep )
          , obj = {}
          , folders = p.split( '/' )
          , currentFolder = null
          , rootFolder = null
          , lastFolder = obj
          , foundModuleDir = false
          , insideModule = false;

        while ( folders.length > 0 ) {
            currentFolder = folders.shift();
            if ( currentFolder === 'modules' ) {
                foundModuleDir = true;
            } else if ( insideModule === false && foundModuleDir === true && currentFolder === this.name ) {
                insideModule = true;
            } else if ( foundModuleDir === true && insideModule === true ) {
                if ( rootFolder === null ) {
                    rootFolder = currentFolder;
                    if ( this[ rootFolder ] !== undefined  ) {
                        lastFolder = obj = this[ rootFolder ];
                    }
                } else {
                    if ( lastFolder[ currentFolder ] === undefined ) {
                        lastFolder[ currentFolder ] = {};
                    }
                    lastFolder = lastFolder[ currentFolder ];
                }
            }
        }
        this[ rootFolder ] = obj;
        this.paths.push( p );
        injector._inherited.factoriesDirs.push( p );
    },

    loadResources: function() {
        this.paths.forEach( this.proxy( 'inspectPathForResources' ) );
    },

    inspectPathForResources: function( pathToInspect ) {
        if ( fs.existsSync( pathToInspect + '/' ) ) {
            fs.readdirSync( pathToInspect + '/' ).forEach( this.proxy( 'addResource', pathToInspect ) );
        }
    },

    addResource: function( pathToInspect, file ) {
        if ( file.match(/.+\.js$/g) !== null && this.Class.excludedFiles.indexOf( file ) === -1 ) {
            var folders = pathToInspect.split('/')
              , name = file.replace( '.js', '' )
              , currentFolder = null
              , rootFolder = null
              , lastFolder = this
              , foundModuleDir = false
              , insideModule = false
              , resource;

            while ( folders.length > 0 ) {
                currentFolder = folders.shift();
                if ( currentFolder === 'modules' ) {
                    foundModuleDir = true;
                } else if ( insideModule === false && foundModuleDir === true && currentFolder === this.name ) {
                    insideModule = true;
                } else if ( foundModuleDir === true && insideModule === true ) {
                    if ( rootFolder === null ) {
                        rootFolder = currentFolder;
                        if ( this[ rootFolder ] !== undefined  ) {
                            lastFolder = this[ rootFolder ];
                        }
                    } else {
                        lastFolder = lastFolder[ currentFolder ];
                    }
                }
            }

            // Load the resource
            resource = require( [ pathToInspect, '/', file ].join( '' ) );

            // Allow injection of certain dependencies
            if ( typeof resource === 'function' && this.Class.injectableFolders.indexOf( rootFolder ) !== -1 ) {
                this.debug( 'Injecting the ' + name + ' resource.' );
                resource = injector.inject( resource );
            }

            // Add the resource to the injector
            if ( name !== 'routes' ) {
                this.debug( 'Adding ' + name + ' to the injector' );
                injector.instance( name, resource );
            }

            // Add the resource to the last object we found
            lastFolder[ name ] = resource;
        }
    },

    initRoutes: function() {
        if ( typeof this.routes === 'function' ) {
            this.debug( 'calling initRoutes() hook...' );
            injector.inject( this.routes );
        }
    }
});

module.exports = {
    Class: Module,
    extend: function() {
        var Reg = new RegExp( '\\)?.*\\(([^\\[\\:]+).*\\)', 'ig' )
          , stack = new Error().stack.split( '\n' );

        // Get rid of the Error at the start
        stack.shift();

        if ( Reg.test( stack[ 1 ] ) ) {
            var modulePath = RegExp.$1.split( path.sep )
              , modulePath = modulePath.splice( 0, modulePath.length - 1 ).join( path.sep )
              , moduleName = path.basename( modulePath );
        } else {
            throw new Error( 'Error loading module, unable to determine modules location and name.' );
        }

        var extendingArgs = [].slice.call( arguments )
          , Static = ( extendingArgs.length === 2 )
                ? extendingArgs.shift()
                : {}
          , Proto = extendingArgs.shift()
          , extendingArgs = [ Static, Proto ]
          , pkg = [ modulePath, 'package.json' ];

        if ( modules[ moduleName ] !== undefined ) {
            moduleDebug( 'Returning previously defined module ' + moduleName + '...' );
            return modules[ moduleName ];
        }

        moduleDebug( 'Setting up ' + moduleName + ' module from path ' + modulePath + '...' );
        if ( Static.extend ) {
            moduleDebug( 'You cannot override the extend() function provided by the CleverStack Module Class!' );
            delete Static.extend;
        }

        if ( fs.existsSync( pkg ) ) {
            moduleDebug( 'Loading ' + pkg + '...' );
            pkg = require( pkg );
        } else {
            pkg = false;
        }

        Proto._camelName = i.camelize( moduleName.replace( /\-/ig, '_' ), false );
        moduleDebug( 'Creating debugger with name ' + Proto._camelName + '...' );
        Proto.debug = require( 'debug' )( Proto._camelName );

        moduleDebug( 'Creating module class...' );
        var Klass = Module.extend( Static, Proto );

        modules[ moduleName ] = Klass;

        moduleDebug( 'Creating instance of module class...' );
        var instance = new Klass( moduleName, modulePath, pkg );

        return instance;
    }
}