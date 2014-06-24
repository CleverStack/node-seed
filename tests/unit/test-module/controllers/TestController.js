module.exports = function ( Controller, TestService ) {
    return Controller.extend(
    {
        autoRouting: true,
        service: TestService
    },
    {
        customAction: function() {
            this.send( { message: 'Hello from customAction' }, 200 );
        },

        hidden: function() {
            this.send( { message: 'You will never see the contents of this function via the browser!' }, 200 );
        }
    });
};