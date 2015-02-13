var Controller      = require( 'clever-controller' )
  , Exceptions      = require( 'exceptions' )
  , models          = require( 'models' )
  , injector        = require( 'injector' )
  , _               = require( 'underscore' );

module.exports = Controller.extend(
/* @Static */
{
    app         : injector.getInstance( 'app' ),
    service     : null
},
/* @Prototype */
{
    getOptionsForService: function() {
        var options = {
            where: _.omit( this.req.query, '_include', '_limit', '_offset' ),
        };
        if (this.req.query._limit) {
            options.limit = this.req.query._limit;
        }
        if (this.req.query._offset) {
            options.offset = this.req.query._offset;
        }
        return this.processIncludes( options );
    },

    processIncludes: function( options ) {
        if ( !!this.req.query._include ) {
            options.include = [];

            this.req.query._include.split( ',' ).forEach( function( include ) {
                include = include.split( '|' );
                var queryInclude = { model: models[ include[ 0 ] ] };
                if ( include.length > 1 ) {
                    queryInclude.as = include[ 1 ];
                }
                options.include.push( queryInclude );
            });
        }
        return options;
    },

    listAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            return this.Class.service.findAll( this.getOptionsForService() );
        } else {
            this.next();
        }
    },

    getAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var options         = this.getOptionsForService();
            options.where.id    = this.req.params.id || this.req.query.id;

            if ( typeof options.where.id === 'undefined' ) {
                return this.listAction.apply( this, arguments );
            }

            return this.Class.service.find( options );
        } else {
            this.next();
        }
    },

    postAction: function() {
        var id = this.req.params.id || this.req.body.id || this.req.query.id;
        if ( !!id ) {
            this.req.params.id  = id;
            this.action         = 'putAction';
            return this.putAction.apply( this, arguments );
        } else if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            return this.Class.service.create( this.req.body, {} );
        } else {
            this.next();
        }
    },

    putAction: function() {
        if ( !this.req.body.id && !this.req.params.id && !this.req.query.id ) {
            return this.postAction.apply( this, arguments );
        } else if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var options         = this.getOptionsForService();
            options.where.id    = this.req.params.id || this.req.query.id;

            return this.Class.service.update( options, _.omit(this.req.body, 'id', 'createdAt', 'updatedAt') );
        } else {
            this.next();
        }
    },

    deleteAction: function() {
        if ( this.Class.service !== null && this.Class.service.model !== undefined ) {
            var options         = this.getOptionsForService();
            options.where.id    = this.req.params.id || this.req.query.id;

            return this.Class.service.destroy( options );
        } else {
            this.next();
        }
    },

    handleServiceMessage: function( obj ) {
        if ( !!this.responseSent ) {
            return;
        }
        
        if ( obj.statusCode ) {
            this.send( obj.message, obj.statusCode );
        } else if ( obj instanceof Exceptions.DuplicateModel || obj instanceof Exceptions.InvalidData || obj instanceof Exceptions.ModelValidation ) {
            this.send( { statusCode: 400, message: obj.message }, 400 );
        } else if ( obj instanceof Exceptions.ModelNotFound ) {
            this.send( { statusCode: 404, message: obj.message }, 404 );
        } else if ( obj instanceof Error ) {
            this.send( { statusCode: 500, message: obj.message, stack: obj.stack ? obj.stack.split('\n') : obj.stack }, 500 );
        } else {
            this.send( obj, 200 );
        }
    }
});