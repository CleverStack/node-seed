'use strict';

var path            = require( 'path' )
  , fs              = require( 'fs' )
  , packageJson     = require( __dirname + '/package.json' )
  , merge           = require( 'deepmerge' )
  , getModulePaths  = require( path.join( __dirname, 'lib', 'utils', 'getModulePaths.js' ) )
  , helpers         = require( path.join( __dirname, 'lib', 'utils', 'helpers.js' ) )

// Cleanup the NODE_PATH for module loading
process.env.NODE_PATH = helpers.nodePath();

module.exports = function( grunt ) {
    // load all grunt tasks
    require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

    // Create the project wide
    var gruntConfig = {
        watch: {
            tests: {
                files: [ 'lib/**/*.js', 'modules/**/*.js' ],
                tasks: [ 'mochaTest:ci' ]
            }
        },
        nodemon: {
            web: {
                script: 'app.js',
                options: {
                    file: 'app.js',
                    ignoredFiles: [ 'README.md', 'node_modules/**' ],
                    watchedExtensions: [ 'js' ],
                    watchedFolders: [ 'lib','modules' ],
                    delayTime: 1,
                    cwd: __dirname
                }
            }
        },
        mochaTest: {
            unit: {
                options: {
                    require: [ 'chai' ],
                    reporter: 'spec',
                    timeout: 5000
                },
                src: [ 'tests/unit/test.utils.bootstrapEnv.js', 'tests/unit/test.utils.moduleLoader.js', 'tests/unit/test.class.Module.js', 'tests/unit/test.class.Controller.js', 'tests/unit/test.class.Service.js', 'tests/unit/*.js' ].concat( getModulePaths( 'tests', 'unit', '*.js' ) )
            },
            e2e: {
                options: {
                    require: 'chai',
                    reporter: 'spec'
                },
                src: [ 'tests/integration/*.js' ].concat( getModulePaths( 'tests', 'integration', '*.js' ) )
            },
            ci: {
                options: {
                    require: 'chai',
                    reporter: 'min'
                },
                src: [ 'tests/**/*.js' ].concat( getModulePaths( 'tests', 'unit', '*.js' ), getModulePaths( 'tests', 'integration', '*.js' ) )
            }
        },
        concurrent: {
            servers: {
                tasks: [ 'server:web' ],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    };

    // Module's Gruntfiles.js
    var callbacks = [];

    // Load all modules Gruntfiles.js
    packageJson.bundledDependencies.forEach(function( moduleName ) {
        var moduleGruntfile = [ path.resolve( __dirname ), 'modules', moduleName, 'Gruntfile.js' ].join( path.sep );
        if ( fs.existsSync( moduleGruntfile ) ) {
            var gruntfile = require( moduleGruntfile )( grunt );

            // Merge (deep) the grunt config objects
            gruntConfig = merge( gruntConfig, gruntfile[ 0 ] );

            // Add the register function to our callbacks
            callbacks.push( gruntfile[ 1 ] );
        }
    });

    // Initialize the config
    grunt.initConfig( gruntConfig );

    // Fire the callbacks and allow the modules to register their tasks
    callbacks.forEach( function( cb ) {
        cb( grunt );
    });

    // Register all project wide tasks with grunt
    grunt.registerTask( 'test', [ 'mochaTest:unit', 'mochaTest:e2e', 'db' ] );
    grunt.registerTask( 'test:unit', [ 'mochaTest:unit', 'db' ] );
    grunt.registerTask( 'test:e2e', [ 'mochaTest:e2e', 'db' ] );
    grunt.registerTask( 'test:ci', [ 'watch:tests' ] );
    grunt.registerTask( 'server', [ 'concurrent:servers' ] );
    grunt.registerTask( 'server:web', [ 'nodemon:web' ] );
    grunt.registerTask( 'serve', [ 'server'] );
    grunt.registerTask( 'default', [ 'server'] );
};