var Q = require ( 'q' )
  , Sequelize = require ( 'sequelize' )
  , SurveyService = null;

module.exports = function ( sequelize,
                            ORMSurveyModel,
                            ORMSurveyQuestionModel ) {

    if ( SurveyService && SurveyService.instance ) {
        return SurveyService.instance;
    }

    SurveyService = require ( 'services' ).BaseService.extend ( {

        formatData: function ( data, operation ) {
            var d = { survey: {}, surveyQuestions: [] };

            d.survey.title = data.title || null;
            d.survey.description = data.description || null;
            d.survey.pointsPossible = data.pointsPossible || 0;
            d.survey.id = !!operation && operation == 'create'
                ? null
                : data.id;

            data.surveyQuestions.forEach ( function ( item ) {
                var o = {
                    id:          item.id          || null,
                    title:       item.title       || null,
                    placeholder: item.placeholder || null,
                    fieldType:   item.fieldType   || null,
                    orderNum:    item.orderNum    || null,
                    points:      item.points      || null,
                    value:      JSON.stringify ( item.value || {} ),
                    isMultiple:  ( /false|true/.test ( item.isMultiple ) )
                        ? item.isMultiple
                        : false,
                    isAutoGrade: ( /false|true/.test ( item.isAutoGrade ) )
                        ? item.isAutoGrade
                        : false
                };

                d.surveyQuestions.push ( o );
            } );

            return d;

        }, 

        verifyData: function ( data ) {
            var condition = false;

            if ( !data.survey.title ) {
                return { statuscode: 403, message: 'invalid title of survey' };
            }

            data.surveyQuestions.forEach ( function ( item, index ) {
                if ( !item.title ) {
                    condition = true;
                }
            });

            if ( condition ) {
                return { statuscode: 403, message: 'invalid title of survey question' };
            }

            return data;
        }, 

        prepData: function ( data, operation ) {
            var fData = this.formatData ( data, operation || '' );
            return this.verifyData ( fData );
        }, 

        getSurveyList: function () {
            var deferred = Q.defer ();

            this
                .find ( { include: [ ORMSurveyQuestionModel ] } )
                .then ( function ( surveys ) {

                    if ( !!surveys && !!surveys.length ) {
                        deferred.resolve ( surveys.map ( function ( s ) { return s.toJSON(); }) );
                    } else {
                        deferred.resolve ( [] );
                    }

                })
                .fail ( deferred.reject );

            return deferred.promise;

        }, 

        getSurveyById: function ( srvId ) {
            var deferred = Q.defer ();

            ORMSurveyModel
                .find ( { where: { id: srvId }, include: [ ORMSurveyQuestionModel ] } )
                .success ( function ( survey ) {

                    if ( !survey || !survey.id ) {
                        deferred.resolve ( { statuscode: 403, message: 'invalid id' } );
                        return;
                    } else {
                        deferred.resolve ( survey.toJSON() );
                    }

                })
                .error ( deferred.reject );

            return deferred.promise;
        }, 

        createSurvey: function ( data ) {
            var deferred = Q.defer ()
              , service = this
              , data = service.prepData ( data, 'create' );

            if ( !!data.statuscode ) {
                deferred.resolve ( data );
            } else {

                service
                    .create ( data.survey )
                    .then ( function ( survey ) {

                        if ( !data.surveyQuestions.length ) {
                            deferred.resolve ( survey.toJSON() );
                            return;
                        }

                        var sqData = data.surveyQuestions.map ( function ( x ) {
                            x.SurveyId = survey.id;
                            return x;
                        } );

                        ORMSurveyQuestionModel
                            .bulkCreate ( sqData )
                            .success ( function () {

                                service
                                    .getSurveyById ( survey.id )
                                    .then( deferred.resolve )
                                    .fail( deferred.reject );
                            } )
                            .error ( deferred.reject );
                    } )
                    .fail ( deferred.reject );
            }

            return deferred.promise;
        }, 

        updateSurvey: function ( data, srvId ) {
            var deferred = Q.defer ()
              , service = this
              , data = service.prepData ( data, 'update' );

            if ( !!data.statuscode ) {
                deferred.resolve ( data );
            } else if ( !data.survey.id || data.survey.id != srvId ) {
                deferred.resolve ( { statuscode: 403, message: 'invalid id' } );
            } else {

                ORMSurveyModel
                    .find ( srvId )
                    .success ( function ( survey ) {

                        if ( !survey ) {
                            deferred.resolve ( { statuscode: 403, message: 'invalid id' } );
                            return;
                        }

                        service
                            .processUpdate ( survey, data )
                            .then ( deferred.resolve )
                            .fail ( deferred.reject );

                    } )
                    .error ( deferred.resolve );
            }

            return deferred.promise;
        }, 

        processUpdate: function ( survey, data ) {
            var deferred = Q.defer ()
              , service = this
              , chainer = new Sequelize.Utils.QueryChainer;

            var questionsToCreate = data.surveyQuestions.map ( function ( x ) {
                delete x.id;
                x.SurveyId = survey.id;

                return x;
            } );


            chainer.add ( ORMSurveyQuestionModel.destroy ( { SurveyId: survey.id } ) );
            chainer.add ( survey.updateAttributes ( data.survey ) );

            chainer
                .run ()
                .success ( function ( results ) {

                    if ( questionsToCreate.length ) {
                        ORMSurveyQuestionModel
                            .bulkCreate ( questionsToCreate )
                            .success ( function () {

                                service
                                    .getSurveyById ( survey.id )
                                    .then( deferred.resolve )
                                    .fail( deferred.reject );
                            } )
                            .error ( deferred.reject );
                    } else {
                        service
                            .getSurveyById ( survey.id )
                            .then( deferred.resolve )
                            .fail( deferred.reject );
                    }

                } )
                .error ( deferred.reject );

            return deferred.promise;
        }, 

        removeSurvey: function ( srvId ) {
            var deferred = Q.defer ()
              , chainer = new Sequelize.Utils.QueryChainer;

            ORMSurveyModel
                .find ( srvId )
                .success ( function ( survey ) {

                    if ( !survey ) {
                        deferred.resolve ( { statuscode: 403, message: 'invalid id' } );
                        return;
                    }

                    chainer.add ( ORMSurveyQuestionModel.destroy ( { 'SurveyId': srvId } ) );
                    chainer.add ( survey.destroy() );

                    chainer
                        .runSerially ()
                        .success ( function ( result ) {
                            deferred.resolve ( { statuscode: 200, message: 'survey and survey question has been deleted' } );
                        } )
                        .error ( deferred.reject );

                } )
                .error ( deferred.resolve );




            return deferred.promise;
        } 

    } );

    SurveyService.instance = new SurveyService ( sequelize );
    SurveyService.Model = ORMSurveyModel;

    return SurveyService.instance;
};