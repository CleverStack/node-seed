var Q = require( 'q' )
  , moment = require( 'moment' )
  , Sequelize = require( 'sequelize' )
  , cheerio = require( 'cheerio' )
  , config = require( 'config' )['clever-email']
  , mailer = require( '../lib/mailer' )( config )
  , EmailTemplateService = null;

module.exports = function ( sequelize,
                            EmailTemplateModel,
                            UserModel ) {

    if ( EmailTemplateService && EmailTemplateService.instance ) {
        return EmailTemplateService.instance;
    }

    EmailTemplateService = require( 'services' ).BaseService.extend( {

        formatData: function ( data ) {
            var o = {
                id:             data.id || null,
                title:          data.title,
                subject:        data.subject,
                body:           data.body,
                AccountId:      data.accId,
                UserId:         data.userId || null,
                isActive:       (/false|true/.test( data.isActive )) ? data.isActive : false,
                isDefault:      (/false|true/.test( data.isDefault )) ? data.isDefault : false,
                useDefault:     (/false|true/.test( data.useDefault )) ? data.useDefault : false,
                hasPermission:  (/false|true/.test( data.hasPermission )) ? data.hasPermission : true
            };

            return o;
        },

        formatEmailTemplateUserForSave: function ( permittedToUsers ) {
            var tu = []
              , arr = permittedToUsers
              , item;

            if ( arr && arr.length ) {
                while ( item = arr.pop() ) {
                    var team = UserModel.build( { id: item } );
                    tu.push( team );
                }
            }

            return tu;
        },

        listTemplates: function ( accId, userId, teamId, role ) {
            var deferred = Q.defer()
              , chainer = new Sequelize.Utils.QueryChainer()
              , query = 'EmailTemplates.AccountId=' + accId;

            if ( !role || (role != 'Owner') ) {
                query += ' AND ( ';
                query += 'EmailTemplates.UserId = ' + userId + ' OR ' +
                    'EmailTemplatesUsers.UserId =' + userId + ' OR ' +
                    'EmailTemplates.hasPermission = false';

                if ( teamId ) {
                    query += ' OR EmailTemplatesTeams.TeamId = ' + teamId;
                }

                query += ' )';
            }

            this
                .find( { where: [ query ], include: [ UserModel ] } )
                .then( function ( result ) {
                    if ( !result.length ) {
                        deferred.resolve( [] );
                        return;
                    }
                    deferred.resolve( result );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        getTemplateById: function ( accId, userId, teamId, tplId, role ) {
            var deferred = Q.defer()
              , query = '( EmailTemplates.id = ' + tplId + ' AND EmailTemplates.AccountId= ' + accId + ' )';

            if ( !role || (role != 'Owner') ) {

                query += ' AND (  ';
                query += '( EmailTemplates.UserId = ' + userId + ' AND EmailTemplates.AccountId= ' + accId + ' ) OR ' +
                    '( EmailTemplatesUsers.UserId = ' + userId + ' AND EmailTemplates.AccountId= ' + accId + ' ) OR ' +
                    '( EmailTemplates.hasPermission = false AND EmailTemplates.AccountId= ' + accId + ' )';

                if ( teamId ) {
                    query += ' OR ( EmailTemplatesTeams.TeamId = ' + teamId + ' AND EmailTemplates.AccountId= ' + accId + ' )';
                }

                query += ' )';
            }

            this
                .findOne( { where: [ query ], include: [ UserModel ] } )
                .then( function ( result ) {

                    if ( !result ) {
                        deferred.resolve( {statuscode: 403, message: 'invalid'} );
                        return;
                    }
                    deferred.resolve( result );
                } )
                .fail( deferred.reject );

            return deferred.promise;
        },

        createEmailTemplate: function ( data ) {
            var deferred = Q.defer()
              , emailData = this.formatData( data );

            this
                .create( emailData )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        getPlaceholderData: function ( data ) {
            var deferred = Q.defer()
              , plData = { template: null }
              , chainer = new Sequelize.Utils.QueryChainer();

            var tplId = data.template_id || data.EmailTemplateId
              , accId = data.accId || data.AccountId;

            chainer.add(
                EmailTemplateModel.find( {
                    where: { id: tplId, AccountId: accId }
                } )
            );

            chainer
                .run()
                .success( function ( result ) {

                    if ( !result[0] ) { // If template does not exist
                        deferred.resolve( null );
                        return;
                    }

                    plData['template'] = JSON.parse( JSON.stringify( result[0] ) );

                    deferred.resolve( plData );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        processTemplateIntrpolation: function ( data, user ) {
            var deferred = Q.defer()
              , service = this
              , tpl = data.template.body;

            var $ = cheerio.load( tpl );

            $( 'span[rel="placeholder"]' ).each( function ( i, elem ) {
                text = service.getPlaceholderText( $( elem ), user );
                $( elem ).replaceWith( text );
            } );

            deferred.resolve( $.root().html() );

            return deferred.promise;
        },

        getPlaceholderText: function ( placeholderNode, user ) {
            var id = placeholderNode.attr( 'id' );
            var parts = id.split( '-' );
            var domain = parts[0];
            var prop = parts[1];
            var propValue;

            //console.log("\n\nPLACEHOLDER: ",domain, prop);

            if ( domain === 'user' ) {
                propValue = user && user[prop];
            }

            if ( domain === 'account' ) {

                if ( prop == 'url' ) {
                    var url = config.hosturl.replace( '://', '://' + user['account']['subdomain'] + '.' );
                    url += '/careers';
                    propValue = url;
                } else {
                    propValue = user['account'] && user['account'][prop];
                }
            }

            return propValue;
        },

        processEmailTemplateAssoc: function ( data, tpl ) {
            var deferred = Q.defer()
              , emailTplUsers = null
              , emailTplTeams = null
              , chainer = new Sequelize.Utils.QueryChainer();

            chainer.add( this.query( 'delete from EmailTemplatesUsers where EmailTemplateId = ' + tpl.id ) );
            chainer.add( this.query( 'delete from EmailTemplatesTeams where EmailTemplateId = ' + tpl.id ) );

            if ( (emailTplUsers = this.formatEmailTemplateUserForSave( data.permittedToUsers )).length ) {
                chainer.add( tpl.setUsers( emailTplUsers ) );
            }

            if ( (emailTplTeams = this.formatEmailTemplateTeamForSave( data.permittedToTeams )).length ) {
                chainer.add( tpl.setTeams( emailTplTeams ) );
            }

            chainer
                .runSerially()
                .success( function ( results ) {

                    var tplJson = JSON.parse( JSON.stringify( tpl ) );
                    tplJson['permittedToUsers'] = [];
                    tplJson['permittedToTeams'] = [];

                    if ( ( emailTplUsers.length ) && ( emailTplTeams.length ) ) {
                        tplJson['permittedToUsers'] = results[ 2 ];
                        tplJson['permittedToTeams'] = results[ 3 ];

                    } else if ( emailTplUsers.length ) {

                        tplJson['permittedToUsers'] = results[ 2 ];
                    } else {

                        tplJson['permittedToTeams'] = results[ 2 ];
                    }

                    deferred.resolve( tplJson );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        handleEmailTemplateUpdate: function ( data ) {
            var deferred = Q.defer()
              , emailData = this.formatData( data );

            this
                .findOne( { where: { id: emailData.id, AccountId: data.accId } } )
                .then( function ( emailTpl ) {

                    // If template is not Default and the User is not the creator send invalid
                    if ( !emailTpl || (!emailTpl.isDefault && ( emailTpl.UserId != data.userId )) ) {
                        deferred.resolve( { statuscode: 401, message: 'invalid' } );
                        return;
                    }

                    return this.updateEmailTemplate( emailTpl, emailData );

                }.bind( this ) )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        updateEmailTemplate: function ( emailTemplate, data ) {
            var deferred = Q.defer();

            //If the EmailTemplate is default do not consider UserId
            if ( emailTemplate.isDefault ) {
                data['UserId'] = null;
            }

            emailTemplate.updateAttributes( data )
                .success( function ( data ) {
                    deferred.resolve( data );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        removeEmailTemplate: function ( userId, tplId ) {
            var deferred = Q.defer()
              , chainer = new Sequelize.Utils.QueryChainer();


            this
                .find( { where: { id: tplId, "UserId": userId } } )
                .then( function ( result ) {

                    if ( !result.length ) {
                        deferred.resolve( { statuscode: 400, message: 'email tempplate does not exist'} );
                        return;
                    }

                    var tpl = result[0];

                    chainer.add( tpl.setTeams( [] ) );
                    chainer.add( tpl.setUsers( [] ) );
                    chainer.add( tpl.destroy() );
                    chainer.run()
                        .success( function () {
                            deferred.resolve( { statuscode: 200, message: 'operation was successfull' } );
                        } )
                        .error( deferred.promise );
                } );

            return deferred.promise;
        },

        sendEmail: function ( payload ) {
            var deferred = Q.defer();

            mailer( payload )
                .then( deferred.resolve )
                .fail( deferred.resolve );

            return deferred.promise;
        }
    } );

    EmailTemplateService.instance = new EmailTemplateService( sequelize );
    EmailTemplateService.Model = EmailTemplateModel;

    return EmailTemplateService.instance;
};