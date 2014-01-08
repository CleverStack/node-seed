var backgroundTasksModule = require('application').classes.ModuleClass.extend({
    init: function() {
        console.log( 'BackgroundTasks module initialized' );
    }
});

module.exports = new backgroundTasksModule( 'application', injector );