'use strict';

var path = require( 'path' )
  , fs = require( 'fs' )
  , packageJson = require( __dirname + '/package.json' )
  , merge = require( 'deepmerge' );

function getModulePaths() {
    var paths = []
      , args = [].slice.call(arguments);

    packageJson.bundledDependencies.forEach( function( name ) {
        paths.push( [ 'modules', name ].concat( args ).join( path.sep ) + path.sep + '**/*.js' );
    });

    return paths;
}

// Set the node path - this works only because the other processes are forked.
process.env.NODE_PATH = process.env.NODE_PATH ? './lib/:./modules/:' + process.env.NODE_PATH : './lib/:./modules/';

module.exports = function( grunt ) {
    // load all grunt tasks
    require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

    // Create the project wide 
    var gruntConfig = {
        watch: {
            docs: {
                files: [ 'lib/**/*.js', 'modules/**/*.js' ],
                tasks: [ 'docular' ]
            },
            tests: {
                files: [ 'lib/**/*.js', 'modules/**/*.js' ],
                tasks: [ 'mochaTest:ci' ]
            }
        },
        docular: {
            baseUrl: 'http://localhost:8888',
            showAngularDocs: false,
            showDocularDocs: false,
            copyDocDir: '/docs',
            docAPIOrder : [ 'doc' ],
            groups: [
                {
                    groupTitle: 'CleverStack Node Seed',
                    groupId: 'cleverstack',
                    groupIcon: 'icon-book',
                    sections: [
                        {
                            id: "controllers",
                            title: "Controllers",
                            scripts: [ "lib/controllers/**/*.js" ].concat( getModulePaths( 'controllers' ) )
                        },
                        {
                            id: "models",
                            title: "Models",
                            scripts: [ "lib/models/**/*.js" ].concat( getModulePaths( 'models' ) )
                        },
                        {
                            id: "services",
                            title: "Services",
                            scripts: [ "lib/services/**/*.js" ].concat( getModulePaths( 'services' ) )
                        },
                        {
                            id: "utils",
                            title: "Utils",
                            scripts: [ "lib/utils/**/*.js" ].concat( getModulePaths( 'utils' ) )
                        },
                        {
                            id: "classes",
                            title: "Classes",
                            scripts: [ "lib/classes/**/*.js" ].concat( getModulePaths( 'classes' ) )
                        },
                        {
                            id: "tasks",
                            title: "Tasks",
                            scripts: [ "lib/tasks/**/*.js" ].concat( getModulePaths( 'tasks' ) )
                        }
                    ]
                }
            ]
        },
        connect: {
            options: {
                port: 8888,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0'
            },
            docs: {
                options: {
                    base: __dirname+'/docs'
                }
            }
        },
        clean: {
            docs: 'docs'
        },
        nodemon: {
            web: {
                options: {
                    file: 'app.js',
                    ignoredFiles: [ 'README.md', 'node_modules/**', 'docs' ],
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
                    reporter: 'spec'
                },
                src: [ 'tests/unit/*.js' ].concat( getModulePaths( 'tests', 'unit' ) )
            },
            e2e: {
                options: {
                    require: 'chai',
                    reporter: 'spec'
                },
                src: [ 'tests/integration/*.js' ].concat( getModulePaths( 'tests', 'integration' ) )
            },
            ci: {
                options: {
                    require: 'chai',
                    reporter: 'min'
                },
                src: [ 'tests/**/*.js' ].concat( getModulePaths( 'tests', 'unit' ), getModulePaths( 'tests', 'integration' ) )
            }
        },
        concurrent: {
            servers: {
                tasks: [ 'server:web', 'server:docs', 'watch:docs' ],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    };

    // Register all project wide tasks with grunt
    grunt.registerTask( 'docs', [ 'clean:docs', 'docular' ] );
    grunt.registerTask( 'test', [ 'mochaTest:unit', 'mochaTest:e2e' ] );
    grunt.registerTask( 'test:unit', [ 'mochaTest:unit' ] );
    grunt.registerTask( 'test:e2e', [ 'mochaTest:e2e' ] );
    grunt.registerTask( 'test:ci', [ 'watch:tests' ] );
    grunt.registerTask( 'server', [ 'concurrent:servers' ] );
    grunt.registerTask( 'server:web', [ 'nodemon:web' ] );
    grunt.registerTask( 'server:docs', [ 'connect:docs', 'watch:docs' ] );
    grunt.registerTask( 'default', [ 'server'] );

    // Load all modules Gruntfiles.js
    packageJson.bundledDependencies.forEach(function( moduleName ) {
        var moduleGruntfile = [ path.resolve( __dirname ), 'modules', moduleName, 'Gruntfile.js' ].join( path.sep );
        if ( fs.existsSync( moduleGruntfile ) ) {
            // Merge (deep) the grunt config objects
            gruntConfig = merge( gruntConfig, require( moduleGruntfile )( grunt ) );
        }
    });

    // Initialize the config
    grunt.initConfig( gruntConfig );
};