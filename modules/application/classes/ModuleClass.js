var Class = require( 'uberclass' )
  , path = require( 'path' )
  , fs = require( 'fs' )
  , debug = require( 'debug' )( 'Modules' )
  , config = injector.getInstance( 'config' )
  , app = injector.getInstance( 'app' )
  , express = injector.getInstance( 'express' );

module.exports = Class.extend(
{
    moduleFolders: [
        'exceptions',
        'classes',
        'models/orm',
        'models/odm',
        'services',
        'controllers',
        'tasks',
        'bin'
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
        this.modulePath = [ path.dirname( path.dirname( __dirname ) ), this.name ].join( path.sep );

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
        this.paths.push( p );

        // No loading models directly through the injector
        if ( !/model/ig.test( p ) ) {
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
        if ( file.match(/.+\.js$/g) !== null && file !== 'index.js' && file !== 'module.js' ) {
            var folders = pathToInspect.split('/')
              , name = file.replace( '.js', '' )
              , currentFolder = null
              , rootFolder = null
              , lastFolder = this
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
                            lastFolder = this[ rootFolder ];
                        }
                    } else {
                        lastFolder = lastFolder[ currentFolder ];
                    }
                }
            }

            if ( rootFolder === 'models' ) {
                lastFolder[ name ] = require( currentFolder ).loadModel( [ pathToInspect, '/', file ].join( '' ) );
            } else {
                lastFolder[ name ] = require( [ pathToInspect, '/', file ].join( '' ) );
            }
        }
    },

    initRoutes: function( injector ) {
        if ( typeof this.routes === 'function' ) {
            debug( 'initRoutes for module ' + this.name );
            injector.inject( this.routes );
        }
    }
});