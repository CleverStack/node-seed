module.exports = function ( SurveyService ) {

    return (require ( 'classes' ).Controller).extend (
        {
            service: SurveyService
        },
        /* @Prototype */
        {

            listAction: function () {

                SurveyService
                    .getSurveyList ()
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            }, 

            getAction: function () {
                var srvId = this.req.params.id;

                SurveyService
                    .getSurveyById ( srvId )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            }, 

            postAction: function () {
                var data = this.req.body;

                if ( data.id ) {
                    this.putAction ();
                    return;
                }

                SurveyService
                    .createSurvey ( data )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );

            }, 

            putAction: function () {
                var srvId = this.req.params.id
                  , data = this.req.body;

                SurveyService
                    .updateSurvey ( data, srvId )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            }, 

            deleteAction: function () {
                var srvId = this.req.params.id;

                SurveyService
                    .removeSurvey ( srvId )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {

                if ( !obj ) {
                    this.send ( {}, 200 );
                }

                if ( obj.statuscode ) {
                    this.send ( obj.message, obj.statuscode );
                    return;
                }

                this.send ( obj, 200 );
            }

        } );
};