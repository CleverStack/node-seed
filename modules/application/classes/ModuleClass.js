var Class = require( 'uberclass' )
  , path = require( 'path' )
  , fs = require( 'fs' );

module.exports = Class.extend(
{
    moduleFolders: [
        'controllers',
        'models',
        'services',
        'tasks',
        'classes'
    ]
},
{
    name: null,

    paths: null,

    setup: function( name, injector ) {
        // Set our module name
        this.name = name;

        // Set the modules location
        this.modulePath = [ path.dirname( path.dirname( __dirname ) ), this.name ].join( path.sep );

        // Add the modulePath to our list of paths
        this.paths = [ this.modulePath ];

        // Add our moduleFolders to the list of paths, and our injector paths
        this.Class.moduleFolders.forEach( this.proxy( 'addFolderToPath', injector ) );

        // Actually load the resources
        this.loadResources();

        // Initialize the routes
        this.initRoutes( injector );
    },

    addFolderToPath: function( injector, folder ) {
        var p = [ this.modulePath, folder ].join( path.sep );
        this[ folder ] = {};
        this.paths.push( p );
        injector._inherited.factoriesDirs.push( p );
    },

    loadResources: function() {
        this.paths.forEach( this.proxy( 'inspectPathForResources' ) );
    },

    inspectPathForResources: function( pathToInspect ) {
        fs.readdirSync( pathToInspect + '/' ).forEach( this.proxy( 'addResource', pathToInspect ) );
    },

    addResource: function( pathToInspect, file ) {
        if ( file.match(/.+\.js$/g) !== null && file !== 'index.js' && file !== 'module.js' ) {
            var name = file.replace( '.js', '' )
              , folder = pathToInspect.split('/').pop();

            if ( this.Class.moduleFolders.indexOf( folder ) !== -1 ) {
                this[ folder ][ name ] = require( [ pathToInspect, '/', file ].join( '' ) );
            } else {
                this[ name ] = require( [ pathToInspect, '/', file ].join( '' ) );
            }
        }
    },

    initRoutes: function( injector ) {
        if ( typeof this.routes === 'function' ) {
            injector.inject( this.routes );
        }
    }
});