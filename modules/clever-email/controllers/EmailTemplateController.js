module.exports = function ( EmailTemplateService ) {

    return (require( 'classes' ).Controller).extend(
        {
            service: EmailTemplateService,
            checkRequiredFields: function ( req, res, next ) {
                var data = req.body;

                if ( !data || !data.title || !data.subject || !data.body ) {
                    res.json( 400, 'Please fill required fields' );
                    return;
                }

            next();
        }
        },
        /* @Prototype */
        {

            listAction: function () {
                var accId = this.req.user.account.id
                  , userId = this.req.user.id
                  , teamId = this.req.user.TeamId
                  , roleName = this.req.user.role.name;

                EmailTemplateService
                    .listTemplates( accId, userId, teamId, roleName )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            getAction: function () {
                var userId = this.req.user.id
                  , accId = this.req.user.account.id
                  , teamId = this.req.user.TeamId
                  , tplId = this.req.params.id
                  , roleName = this.req.user.role.name;

                EmailTemplateService
                    .getTemplateById( accId, userId, teamId, tplId, roleName )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            postAction: function () {
                var accId = this.req.user.account.id
                  , userId = this.req.user.id
                  , data = this.req.body;

                if ( data.id ) {
                    this.putAction();
                    return;
                }

                data['accId'] = accId;
                data['userId'] = userId;

                EmailTemplateService
                    .createEmailTemplate( data )
                    .then( this.proxy( 'handleEmailTemplateAssoc', data ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            handleEmailTemplateAssoc: function ( dataWithAssocs, savedEmailTpl ) {

                if ( savedEmailTpl['statuscode'] != undefined ) {
                    this.handleServiceMessage( savedEmailTpl );
                    return;
                }

                EmailTemplateService
                    .processEmailTemplateAssoc( dataWithAssocs, savedEmailTpl )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            putAction: function () {
                var accId = this.req.user.account.id
                  , userId = this.req.user.id
                  , data = this.req.body;

                if ( !data.id ) {
                    this.send( 'invalid id', 401 );
                    return;
                }

                data['accId'] = accId;
                data['userId'] = userId;

                EmailTemplateService
                    .handleEmailTemplateUpdate( data )
                    .then( this.proxy( 'handleEmailTemplateAssoc', data ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            previewAction: function () {
                var accId = this.req.user.account.id
                  , tplId = this.req.params.id
                  , data = {};

                if ( !tplId ) {
                    this.send( 403, 'Invalid Template ID' );
                    return;
                }

                data.accId = accId;
                data.template_id = tplId;
                data.prospect_id = this.req.query.prospect_id || null;
                data.job_id = this.req.query.job_id || null;

                EmailTemplateService
                    .getPlaceholderData( data )
                    .then( this.proxy( 'handleTemplateInterpolation' ) )
                    .fail( this.proxy( 'handleException' ) );

            },

            handleTemplateInterpolation: function ( data ) {
                var user = this.req.user;

                if ( !data ) {
                    this.send( 403, 'Invalid Template ID' );
                    return;
                }

                EmailTemplateService
                    .processTemplateIntrpolation( data, user )
                    .then( function ( html ) {
                        this.render( 'preview', { strHTML: html, tplTitle: 'Email Template Preview' } );
                    }.bind( this ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            deleteAction: function () {
                var userId = this.req.user.id
                  , tplId = this.req.params.id;

                EmailTemplateService
                    .removeEmailTemplate( userId, tplId )
                    .then( this.proxy( 'handleServiceMessage' ) )
                    .fail( this.proxy( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {

                if ( obj.statuscode ) {
                    this.send( obj.message, obj.statuscode );
                    return;
                }

                this.send( obj, 200 );
            }
        } );
};