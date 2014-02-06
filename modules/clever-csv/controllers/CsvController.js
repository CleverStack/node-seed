module.exports = function ( CsvService ) {

    return ( require ( 'classes' ).Controller ).extend (
        {
            service: CsvService
        },
        /* @Prototype */
        {
            typesAction: function () {
                CsvService
                    .getAllPossibleTypes ()
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            examineAction: function () {
                var data = {
                    type: this.req.body.type,
                    url: this.req.body.url,
                    filename: this.req.body.filename || '',
                    options: this.req.body.options || {}
                };

                if ( !data.type || !data.url ) {
                    return this.send ( 'Insufficient data', 400 );
                }

                CsvService
                    .handleExamineProcess ( data )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            submitDraftAction: function () {
                var data = {
                    columns: this.req.body.columns,
                    path: this.req.body.tmpCsvPath,
                    type: this.req.body.type,
                    options: this.req.body.options || {}
                };

                if ( !data.columns || !data.path || !data.type ) {
                    return this.send ( 'Insufficient data', 400 );
                }

                CsvService
                    .handleSubmitDraftProcess ( data )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            submitFinalAction: function () {
                var data = {
                    columns: this.req.body.columns,
                    path: this.req.body.tmpCsvPath,
                    type: this.req.body.type,
                    options: this.req.body.options || {}
                };

                if ( !data.columns || !data.path || !data.type ) {
                    return this.send ( 'Insufficient data', 400 );
                }

                CsvService
                    .handleSubmitFinalProcess ( data )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {

                if ( obj.statuscode ) {
                    this.send ( obj.message, obj.statuscode );
                    return;
                }

                this.send ( obj, 200 );
            }

        } );
};
