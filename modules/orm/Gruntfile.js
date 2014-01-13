'use strict';

module.exports = function( grunt ) {
    grunt.initConfig({
        exec: {
            rebase: {
                cmd: "NODE_PATH=./lib/:./modules/; node modules/orm/bin/rebase.js"
            },
            seed: {
                cmd: "NODE_PATH=./lib/:./modules/; node modules/orm/bin/seedModels.js"
            }
        }
    });

    // Register each command
    grunt.registerTask('db:rebase', ['exec:rebase']);
    grunt.registerTask('db:seed', ['exec:seed']);

    // Register db command (runs one after the other)
    grunt.registerTask('db', ['db:rebase', 'db:seed']);
};