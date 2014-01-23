/**
 * @doc module
 * @name exampleModule
 * @description
 * This is an example module used to showcase how to use the node-seed
 */

/**
 * @doc module
 * @name exampleModule.controllers:ExampleController
 * @description
 * Sets up an example controller to showcase how to use clever-controller
 */
module.exports = function( ExampleService ) {
    return (require('classes').Controller).extend(
    {
        service: ExampleService
    },
    {

        /**
         * 'GET/PUT/POST/DELETE /example/custom'
         */
        customAction: function() {
            this.send({
                message: "Hello from customAction inside ExampleController"
            });
        },

        /**
         * This function can never be called because it does not have 'Action' on the end of it
         */
        hidden: function() {
            console.log('Hidden function called, this should be impossible');
            process.exit();
        }
    });
}