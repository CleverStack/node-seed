var Class = require( 'uberclass' )
  , path = require( 'path' )
  , fs = require( 'fs' )
  , debug = require( 'debug' )( 'Modules' )
  , config = injector.getInstance( 'config' )
  , app = injector.getInstance( 'app' )
  , express = injector.getInstance( 'express' )
  , moduleLoader = injector.getInstance( 'moduleLoader' );

module.exports = Class.extend(
{
    moduleFolders: [
        'exceptions',
        'classes',
        'models/orm',
        'models/odm',
        'services',
        'controllers',
        'tasks'
    ],

    injectableFolders: [
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

    paths: null,

    config: null,

    setup: function( name, injector ) {
        debug( 'setup called for module ' + name );
        
        // Set our module name
        this.name = name;

        // Allow some code to be executed before the main setup
        this.hook( 'preSetup' );

        // Set our config if there is any
        this.config = typeof config[ name ] === 'object'
            ? config[ name ]
            : {};

        // Set the modules location
        this.modulePath = [ path.dirname( path.dirname( __dirname ) ), 'modules', this.name ].join( path.sep );

        // Add the modulePath to our list of paths
        this.paths = [ this.modulePath ];

        // Add our moduleFolders to the list of paths, and our injector paths
        this.Class.moduleFolders.forEach( this.proxy( 'addFolderToPath', injector ) );

        this.hook( 'preResources' );
        
        this.loadResources();

        if ( typeof this.configureApp === 'function' ) {
            debug( 'configureApp hook called for module ' + this.name );
            app.configure( this.proxy( 'configureApp', app, express ) );
        }

        this.hook( 'preInit' );
    },

    hook: function( hookName ) {
        if ( typeof this[ hookName ] === 'function' ) {
            debug( hookName + ' hook called for module ' + this.name );
            this[ hookName ]( injector );
        }
    },

    addFolderToPath: function( injector, folder ) {
        var p = [ this.modulePath, folder ].join( path.sep )
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

        // Dont add paths for disabled model modules
        if ( rootFolder !== 'models' || ( rootFolder === 'models' && moduleLoader.moduleIsEnabled( currentFolder ) ) ) {
            this.paths.push( p );
            injector._inherited.factoriesDirs.push( p );
        }
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

            if ( rootFolder === 'models' ) {
                // Only include models for enabled modules
                if ( moduleLoader.moduleIsEnabled( currentFolder ) ) {
                    lastFolder[ name ] = require( currentFolder ).getModel( [ pathToInspect, '/', file ].join( '' ) );
                }
            } else {
                // Load the resource
                resource = require( [ pathToInspect, '/', file ].join( '' ) );

                // Allow injection of certain dependencies
                if ( typeof resource === 'function' && this.Class.injectableFolders.indexOf( rootFolder ) !== -1 ) {
                    debug( 'Injecting the ' + name + ' resource.' );
                    resource = injector.inject( resource );
                }

                // Add the resource to the injector
                if ( name !== 'routes' ) {
                    debug( 'Adding ' + name + ' to the injector' );
                    injector.instance( name, resource );
                }

                // Add the resource to the last object we found
                lastFolder[ name ] = resource;
            }
        }
    },

    initRoutes: function() {
        if ( typeof this.routes === 'function' ) {
            debug( 'initRoutes for module ' + this.name );
            injector.inject( this.routes );
        }
    }
});