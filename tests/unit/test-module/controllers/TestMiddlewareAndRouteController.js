module.exports = function ( Controller ) {
    var middlewareWasCalled = false;
    return Controller.extend(
    {
        route: '/testcustomroute|/testcustomroutes',

        autoRouting: [ 'middlewareTester' ],

        middlewareTester: function( req, res, next ) {
            middlewareWasCalled = true;
            next();
        }
    },
    {
        listAction: function() {
            this.send( { message: 'Hello from TestMiddlewareAndRouteController' }, 200 );
        }
    });
};