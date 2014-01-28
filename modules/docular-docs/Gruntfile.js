'use strict';

var path = require( 'path' )
  , appRoot = path.resolve( [ __dirname, '..', '..', '' ].join( path.sep ) )
  , getModulePaths = require( [ appRoot, 'lib', 'utils', 'getModulePaths.js' ].join( path.sep ) );

module.exports = function( grunt ) {
    return [{
        watch: {
            docs: {
                files: [ 'lib/**/*.js', 'modules/**/*.js' ],
                tasks: [ 'docular' ]
            }
        },

        docular: {
            baseUrl: [ 'http://', require("os").hostname() ,':8888' ].join( '' ),
            showAngularDocs: false,
            showDocularDocs: false,
            copyDocDir: '/docs',
            docAPIOrder : [ 'doc', 'angular' ],
            docular_webapp_target: '/docs',
            groups: [
                {
                    groupTitle: 'Modules',
                    groupId: 'cleverstack',
                    groupIcon: 'icon-book',
                    sections: [
                        {
                            id: "exampleModule",
                            title: "Example Module",
                            scripts: getModulePaths( 'controllers', '' )
                        }
                    ]
                }
            ]
        },

        // connect: {
        //     docs: {
        //         options: {
        //             post: 8888,
        //             base: '/docs',
        //             docular_webapp_target: '/docs'
        //         }
        //     }
        // 

        'docular-server': {
            port: 8888,
            docular_webapp_target: appRoot + '/docs/'
        },

        clean: {
            docs: 'docs'
        },

        concurrent: {
            servers: {
                tasks: [ 'server:docs', 'watch:docs' ],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        nodemon: {
            web: {
                options: {
                    ignoredFiles: 'docs',
                }
            }
        },
    }, function( grunt ) {
        // load all grunt tasks from this module
        // require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );
        require( 'grunt-docular/tasks/docular.js' )( grunt );
        
        // Register each command
        grunt.registerTask( 'docs', [ 'clean:docs', 'docular' ] );
        grunt.registerTask( 'server:docs', [ 'connect:docs', 'watch:docs' ] );
        
    }];
};