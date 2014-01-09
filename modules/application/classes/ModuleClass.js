var Class = require( 'uberclass' )
  , path = require( 'path' )
  , fs = require( 'fs' );

module.exports = Class.extend(
{
    moduleFolders: [
        'classes',
        'models/orm',
        'models/odm',
        'services',
        'controllers',
        'tasks',
        'bin'
    ],

    moduleHooks: [
        'initInjector',
        'initModels',
        'initViews'
    ]
},
{
    name: null,

    paths: null,

    init: function( name, injector ) {
        // Set our module name
        this.name = name;

        // Set the modules location
        this.modulePath = [ path.dirname( path.dirname( __dirname ) ), this.name ].join( path.sep );

        // Add the modulePath to our list of paths
        this.paths = [ this.modulePath ];

        // Add our moduleFolders to the list of paths, and our injector paths
        this.Class.moduleFolders.forEach( this.proxy( 'addFolderToPath', injector ) );

        // Run our hooks
        this.runHooks( injector );

        // Initialize the routes, they should ALWAYS come last
        this.initRoutes( injector );

        // Actually load the resources
        this.loadResources();
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
            injector.inject( this.routes );
        }
    },

    runHooks: function( injector ) {
        this.Class.moduleHooks.forEach( this.proxy( 'runHook', injector ) );
    },

    runHook: function( injector, hook ) {
        if ( typeof this[ hook ] === 'function' ) {
            this[ hook ]( injector );
        }
    }
});