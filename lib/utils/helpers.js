var os          = require( 'os' )
  , fs          = require( 'fs' )
  , path        = require( 'path' )
  , packageJson = require( path.resolve( path.join( __dirname, '..', '..', 'package.json' ) ) )
  , isWin       = /^win32/.test( os.platform() );

module.exports = {

    /**
     * Makes sure that the NODE_PATH is correctly set in the current process so that child processes
     * have access to cleverstack modules as well as magic modules like require( 'config' )
     * 
     * @return {String} Returns the path joined by the correct delimiter for the operating system
     */
    nodePath: function() {
        var delimiter       = isWin ? ';' : ':'
          , currentPaths    = process.env.NODE_PATH ? process.env.NODE_PATH.split( delimiter ) : []
          , appRoot         = path.resolve( path.join( __dirname, '..', '..' ) )
          , paths           = [ path.join( appRoot, 'lib' ), path.join( appRoot, 'modules' ) ];

        currentPaths.forEach( function( _path ) {
            if ( !/lib(\/|\\)?$|modules(\/|\\)?$/.test( _path ) ) {
                paths.push( _path );
            }
        });

        return paths.join( delimiter );
    },

    /**
     * Helper function that will load a file based on its name from every enabled module in your application
     * 
     * @param  {String}   fileName Name of the file you want to load
     * @param  {Object}   config   Applications config object
     * @param  {Object}   cluster  NodeJS Cluster module
     * @param  {Function} debug  Function that can be called with debugging information
     * 
     * @return {null}
     */
    loadModulesFileByName: function( fileName, config, cluster, debug ) {
        packageJson.bundledDependencies.forEach(function( moduleName ) {
            var file = path.resolve( path.join( __dirname, '..', '..', 'modules', moduleName, 'bin', 'app.js' ) );
            if ( fs.existsSync( file ) ) {

                debug( 'Loading ' + fileName + ' from ' + moduleName );
                require( file )( cluster, config, packageJson, debug );

            }
        });
    }
}