var _           = require( 'underscore' )
  , inflect     = require( 'i' )();

module.exports  = {
    setupSoftDeleteable: function( Static ) {
        if ( !!Static.softDeleteable ) {
            if ( modelType.toLowerCase() === 'odm' ) {
                Static._schema[ Static.deletedAt ] = {
                    type: Date,
                    default: null
                };
            }
        }
    },

    getSchemaFromProto: function( Proto, Static, key ) {
        var prop        = Proto[ key ]
          , columnName  = !!this.underscored ? inflect.underscore( key ) : key;
         
        if ( !!prop.columnName && key !== prop.columnName ) {
            Static._customColumnNames.push( { key: key, columnName: prop.columnName } );
        } else if ( !!Static.underscored && key !== columnName ) {
            Static._customColumnNames.push( { key: key, columnName: columnName } );
        }
        
        if ( typeof prop === 'function' && [ String, Number, Boolean, Date, Buffer, this.Types.ENUM, this.Types.TINYINT, this.Types.BIGINT, this.Types.FLOAT, this.Types.DECIMAL, this.Types.TEXT ].indexOf( Proto[ key ] ) === -1 && key !== 'defaults') {

        } else if ( key !== 'defaults' ) {

            if ( typeof Static._schema !== 'object' ) {
                Static._schema = {};
            }

            if ( typeof Static._getters !== 'object' ) {
                Static._getters = {};
            }

            if ( typeof Static._setters !== 'object' ) {
                Static._setters = {};
            }

            Static._schema[ key ] = prop;
            Static._getters[ key ] = function() {
                if ( key === 'id' && Static.type.toLowerCase() === 'odm' ) {
                    return this._model._id;
                } else {
                    return this._model[ !!prop.columnName ? prop.columnName : columnName ];
                }
            };
            Static._setters[ key ]  = function( val ) {
                this._dirty         = true;
                this._model[ !!prop.columnName ? prop.columnName : columnName ] = val;
                this._changed.push( key );

                return this;
            };

            delete Proto[ key ];
        }
    },

    renameCustomColumnsForQuery: function( findOptions ) {
        if ( findOptions.where && this._customColumnNames.length > 0 ) {
            Object.keys( findOptions.where ).forEach( function( key ) {
                var val     = findOptions.where[ key ]
                  , newKey  = _.findWhere( this._customColumnNames, { key: key } );

                if ( newKey ) {
                    findOptions.where[ newKey.columnName ] = val;
                    delete findOptions.where[ key ];
                }
            }.bind( this ) );
        }
    },

    renameCustomColumnsForOutput: function( data ) {
        this.Class._customColumnNames.forEach( function( column ) {
            if ( data[ column.key ] ) {
                data[ column.columnName ] = data[ column.key ];
                delete data[ column.key ];
            }
        });
    }
};