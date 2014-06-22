var injector    = require( 'injector' )
  , Class       = injector.getInstance( 'Class' )
  , path        = require( 'path' )
  , async       = require( 'async' )
  , fs          = require( 'fs' )
  , i           = require( 'i' )()
  , moduleDebug = require('debug')( 'Modules' )
  , config      = injector.getInstance( 'config' )
  , modules     = {}
  , Module;

Module = exports.Class = Class.extend(
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

        // Return no arguments to init
        return [];
    },

    hook: function( hookName ) {
        if ( typeof this[ hookName ] === 'function' ) {
            this.debug( 'calling ' + hookName + '() hook...' );

            // @TODO implement injector.injectSync() for use cases like this
            this[ hookName ]();
        }
    },

    addFolderToPath: function( injector, folder ) {
        var folderPath      = path.join( this.path, folder )
          , folders         = folder.split( '/' )
          , currentFolder   = null
          , rootFolder      = null
          , obj             = {}
          , lastFolder      = obj;

        while ( folders.length > 0 ) {
            currentFolder = folders.shift();
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

        this[ rootFolder ] = obj;
        this.paths.push( folderPath );
        injector._inherited.factoriesDirs.push( folderPath );
    },

    loadResources: function() {
        async.forEach(
            this.paths,
            this.proxy( 'inspectPathForResources' ),
            this.proxy( 'resourcesLoaded' )
        );
    },

    resourcesLoaded: function( err ) {
        this.emit( 'resourcesLoaded', err || null );
    },

    inspectPathForResources: function( pathToInspect, callback ) {
        var that = this;

        if ( fs.existsSync( pathToInspect + path.sep ) ) {
            fs.readdir( pathToInspect + path.sep, function( err, files ) {
                async.forEach( files, that.proxy( 'addResource', pathToInspect ), callback );
            });
        } else {
            callback( null );
        }
    },

    addResource: function( pathToInspect, file, callback ) {
        if ( file.match(/.+\.js$/g) !== null && this.Class.excludedFiles.indexOf( file ) === -1 ) {
            var folders = pathToInspect.split( path.sep )
              , name = file.replace( '.js', '' )
              , currentFolder = null
              , insideModule = false
              , rootFolder = null
              , lastFolder = this
              , resource;

            while ( folders.length > 0 ) {
                currentFolder = folders.shift();
                if ( insideModule === false && currentFolder === this.name ) {
                    // Make sure that this is the LAST instance of the name
                    if ( folders.indexOf( this.name ) === -1 ) {
                        insideModule = true; 
                    }
                } else if ( insideModule === true ) {
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
            resource = require( [ pathToInspect, path.sep, file ].join( '' ) );

            // Do not load dependencies that can be injected
            if ( this.Class.injectableFolders.indexOf( rootFolder ) === -1 ) {
                
                if ( this.Class.injectableFolders.indexOf( name ) === -1 )  {
                    // Add the resource to the injector
                    if ( name !== 'routes' ) {
                        this.debug( 'Adding ' + name + ' to the injector' );
                        injector.instance( name, resource );
                    }

                    // Add the resource to the last object we found
                    lastFolder[ name ] = resource;
                    callback( null );
                } else {
                    callback( null );
                }
            } else {

                this.debug( 'Loading ' + name + ' using the injector...' );
                injector.inject( resource, function( resource ) {
                    lastFolder[ name ] = resource;
                    callback( null );
                });
            }
        } else {
            callback( null );
        }
    },

    initRoutes: function() {
        if ( typeof this.routes === 'function' ) {
            this.debug( 'calling initRoutes() hook...' );
            injector.inject( this.routes );
        }
    }
});

exports.extend = function() {
    var Reg             = new RegExp( '.*\\(([^\\)]+)\\:.*\\:.*\\)', 'ig' )
      , stack           = new Error().stack.split( '\n' )
      , extendingArgs   = [].slice.call( arguments )
      , Static          = ( extendingArgs.length === 2 ) ? extendingArgs.shift() : {}
      , Proto           = extendingArgs.shift()
      , modulePath
      , moduleName
      , pkg;

    // Get rid of the Error at the start
    stack.shift();

    if ( Reg.test( stack[ 1 ] ) ) {
        modulePath = RegExp.$1.split( path.sep );
        modulePath = modulePath.splice( 0, modulePath.length - 1 ).join( path.sep );
        pkg        = [ modulePath, 'package.json' ];
        moduleName = path.basename( modulePath );
    } else {
        throw new Error( 'Error loading module, unable to determine modules location and name.' );
    }

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
    var Klass = Module.callback( 'extend' )( Static, Proto )
      , instance = Klass.callback( 'newInstance' )( moduleName, modulePath, pkg );

    modules[ moduleName ] = instance;

    return instance;
}