module.exports = function ( Controller, TestService ) {
    return Controller.extend(
    {
        autoRouting: true,
        service: TestService
    },
    {
    	putAction: function() {
    		this.putCalled = true;
    		return this._super.apply( this, arguments );
    	}
    });
};