function DuplicateModel( message ) {
  Error.call( this );
  Error.captureStackTrace( this, this.constructor );

  this.name = this.constructor.name;
  this.message = message;
}

require( 'util' ).inherits( DuplicateModel, Error );

module.exports = DuplicateModel;