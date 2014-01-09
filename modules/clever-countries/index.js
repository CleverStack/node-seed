var applicationModule = require('classes').ModuleClass.extend({
    init: function() {
        console.log( 'Application module initialized' );
    }
});

module.exports = new applicationModule( 'application', injector );