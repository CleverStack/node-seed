function InvalidData( message ) {
	Error.call( this );
	Error.captureStackTrace( this, this.constructor );

	this.name = this.constructor.name;
    this.message = message;
}

require( 'util' ).inherits( InvalidData, Error );

module.exports = InvalidData;