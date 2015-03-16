module.exports = {
  config: {
    servers: {
      tasks: ['watch:schema', 'nodemon:cluster'],
      options: {
        logConcurrentOutput: true
      }
    },
    debug: {
      tasks: ['exec:debugApp', 'node-inspector:app'],
      options: {
        logConcurrentOutput: true
      }
    }
  },
  register: function(grunt) {
    grunt.registerTask('server',       ['concurrent:servers']);
    grunt.registerTask('server:debug', ['concurrent:debug']);
    grunt.registerTask('server:web',   ['server']);
    grunt.registerTask('serve:debug',  ['server:debug']);
    grunt.registerTask('serve',        ['server:web']);
    grunt.registerTask('default',      ['serve']);
  }
};
