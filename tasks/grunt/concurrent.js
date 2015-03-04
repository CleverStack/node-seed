module.exports = {
  config: {
    servers: {
      tasks: ['watch:schema', 'nodemon:web'],
      options: {
        logConcurrentOutput: true
      }
    }
  },
  register: function(grunt) {
    grunt.registerTask('server',     ['concurrent:servers']);
    grunt.registerTask('server:web', ['server']);
    grunt.registerTask('serve',      ['server']);
    grunt.registerTask('default',    ['server']);
  }
}
