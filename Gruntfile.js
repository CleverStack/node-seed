'use strict';

var path = require( 'path' )
  , fs = require( 'fs' )
  , packageJson = require( __dirname + '/package.json' );

module.exports = function( grunt ) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
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
                    groupTitle: 'CleverStack Seed',
                    groupId: 'cleverstack',
                    groupIcon: 'icon-book',
                    sections: [
                        {
                            id: "controllers",
                            title: "Controllers",
                            scripts: [
                                "lib/controllers/**/*.js",
                                "modules/**/controllers/**/*.js"
                            ]
                        },
                        {
                            id: "models",
                            title: "Models",
                            scripts: [
                                "lib/models/**/*.js",
                                "modules/**/models/**/*.js"
                            ]
                        },
                        {
                            id: "services",
                            title: "Services",
                            scripts: [
                                "lib/services/**/*.js",
                                "modules/**/services/**/*.js"
                            ]
                        },
                        {
                            id: "utils",
                            title: "Utils",
                            scripts: [
                                "lib/utils/**/*.js",
                                "modules/**/utils/**/*.js"
                            ]
                        },
                        {
                            id: "classes",
                            title: "Classes",
                            scripts: [
                                "lib/classes/**/*.js",
                                "modules/**/classes/**/*.js"
                            ]
                        },
                        {
                            id: "tasks",
                            title: "Tasks",
                            scripts: [
                                "lib/tasks/**/*.js",
                                "modules/**/tasks/**/*.js"
                            ]
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
                    require: 'chai',
                    reporter: 'spec'
                },
                src: ['modules/**/tests/unit/*.js']
            },
            e2e: {
                options: {
                    require: 'chai',
                    reporter: 'spec'
                },
                src: ['modules/**/tests/integration/**/*.js']
            },
            ci: {
                options: {
                    require: 'chai',
                    reporter: 'min'
                },
                src: ['modules/**/tests/integration/**/*.js', 'modules/**/tests/unit/**/*.js']
            }
        },
        concurrent: {
            servers: {
                tasks: ['server:web', 'server:docs', 'watch:docs'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.registerTask('docs', ['clean:docs','docular']);

    grunt.registerTask('test', ['mochaTest:unit']);
    grunt.registerTask('test:unit', ['mochaTest:unit']);
    grunt.registerTask('test:e2e', ['mochaTest:e2e']);
    grunt.registerTask('test:ci', ['watch:tests']);

    grunt.registerTask('server', ['concurrent:servers']);
    grunt.registerTask('server:web', ['nodemon:web']);
    grunt.registerTask('server:docs', ['connect:docs', 'watch:docs']);

    grunt.registerTask('default', ['server']);

    // Load all modules Gruntfiles.js
    packageJson.bundledDependencies.forEach(function( moduleName ) {
        var moduleGruntfile = [ path.resolve( __dirname ), 'modules', moduleName, 'Gruntfile.js' ].join( path.sep );
        if ( fs.existsSync( moduleGruntfile ) ) {
            require( moduleGruntfile )( grunt );
        }
    });
};