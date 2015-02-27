function ModelValidation( message ) {
  Error.call( this );
  Error.captureStackTrace( this, this.constructor );

  this.name = this.constructor.name;
  this.message = message;
}

require( 'util' ).inherits( ModelValidation, Error );

module.exports = ModelValidation;