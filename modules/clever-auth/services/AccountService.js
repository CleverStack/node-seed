var Q = require( 'q' )
  , async = require( 'async' )
  , Sequelize = require( 'sequelize' )
  , crypto = require( 'crypto' )
  , sendgrid = require( 'utils' ).sendgrid
  , ejsFileRender = require( 'utils' ).ejsfilerender
  , shortId = require( 'shortid' )
  , config = require( 'config' )
//  , appSeed = require( './../../config/appData' )
  , AccountService = null;


module.exports = function ( sequelize, 
                            ORMAccountModel, 
                            ORMUserModel, 
                            ORMRoleModel, 
                            ORMEmailTemplateModel, 
                            ORMSubscriptionModel, 
                            ORMPermissionModel, 
                            ORMWorkflowModel, 
                            ORMWorkflowStepsModel ) {

    if ( AccountService && AccountService.instance ) {
        return AccountService.instance;
    }

    AccountService = require( 'services' ).BaseService.extend( {

        formatRegistrationData: function ( data, operation ) {
            var d = { user: {}, account: {}, roles: [] }
              , emailURL = ''
              , hashedId = shortId.seed( 1000 ).generate()
              , envName = ( config.environmentName == 'DEV' ) ? 'dev' : ( config.environmentName == 'PROD' ) ? 'prod' : 'stage';

            emailURL = ( envName != 'prod' )
                ? hashedId + '@' + envName + '.bolthr.clevertech.biz'
                : hashedId + '@app-mail.bolthr.com';

//            d['roles'] = appSeed['DefaultRoles'];
//            d['rolePermissions'] = appSeed['RolePermissions'];
//            d['templates'] = appSeed['DefaultEmailTemplates'];

            d['account']['name'] = data['company'];
            d['account']['subdomain'] = data['subdomain'];
            d['account']['emailFwd'] = emailURL;
            d['account']['active'] = false;
            d['account']['SubscriptionId'] = null;

            d['user']['title'] = data['title'] || null;
            d['user']['username'] = ( data['username'] ) ? data['username'] : data['email'];
            d['user']['email'] = data['email'];
            d['user']['firstname'] = data['firstname'];
            d['user']['lastname'] = data['lastname'];
            d['user']['password'] = crypto.createHash( 'sha1' ).update( data['password'] ).digest( 'hex' );
            d['user']['phone'] = data['phone'] || null;
            d['user']['active'] = false;
            d['user']['confirmed'] = false;
            d['user']['hasAdminRight'] = true;
            d['user']['RoleId'] = null;
            d['user']['AccountId'] = null;

            return d;
        },

        processRegistration: function ( data ) {
            var deferred = Q.defer()
              , fData = this.formatRegistrationData( data );

            this
                .handleRegistrationStep1( fData )
                .then( deferred.resolve )
                .fail( deferred.reject );

            return deferred.promise;
        },

        handleRegistrationStep1: function ( data ) {
            var deferred = Q.defer()
              , chainer = new Sequelize.Utils.QueryChainer();

            //Perform all seeds
            chainer.add( ORMAccountModel.create( data['account'] ) );
            chainer.add( ORMUserModel.create( data['user'] ) );
            chainer.add( ORMSubscriptionModel.find( { where: { name: 'Trial' } } ) );
            chainer.add( ORMPermissionModel.findAll() );

            chainer
                .run()
                .success( function ( results ) {
                    var account = results[0]
                      , user = results[1]
                      , subsciption = results[2];

                    this
                        .handleRegistrationStep2( account, user, subsciption.id, data )
                        .then( deferred.resolve )
                        .fail( deferred.reject );

                }.bind( this ) )
                .error( deferred.reject );

            return deferred.promise;
        },

        handleRegistrationStep2: function ( account, user, subId, data ) {
            var deferred = Q.defer()
              , chainer = new Sequelize.Utils.QueryChainer();

            data['roles'] = data['roles'].map( function ( x ) {
                x['AccountId'] = account.id;
                return x;
            } );

            data['templates'] = data['templates'].map( function ( x ) {
                x['UserId'] = user.id;
                x['AccountId'] = account.id;
                return x;
            } );

            chainer.add( account.updateAttributes( { SubscriptionId: subId } ) );
            chainer.add( ORMRoleModel.bulkCreate( data['roles'] ) );
            chainer.add( ORMEmailTemplateModel.bulkCreate( data['templates'] ) );


            chainer
                .run()
                .success( function ( results ) {

                    this
                        .handleRegistrationStep3( account, user, data )
                        .then( deferred.resolve )
                        .fail( deferred.reject );

                }.bind( this ) )
                .error( deferred.reject );

            return deferred.promise;
        },

        handleRegistrationStep3: function ( account, user, data ) {
            var deferred = Q.defer()
              , service = this
              , roleOwnerId = null
              , chainer = new Sequelize.Utils.QueryChainer();


            ORMRoleModel
                .findAll( { where: { AccountId: account.id } } )
                .success( function ( roles ) {

                    var role = null;
                    while ( role = roles.pop() ) {

                        if ( role.name == 'Owner' ) {
                            roleOwnerId = role.id;
                        }

                        rolePerms = data['rolePermissions'][role.name].map( function ( x ) {
                            return ORMPermissionModel.build( {id: x.id} )
                        } );
                        chainer.add( role.setPermissions( rolePerms ) );
                    }

                    chainer.add( user.updateAttributes( {RoleId: roleOwnerId, AccountId: account.id } ) );

                    chainer
                        .run()
                        .success( function ( results ) {
                            var userJSON = results[results.length - 1];
                            userJSON['account'] = account;

                            //We have to send userJSON back to the controller
                            service
                                .handleRegistrationStep4( account )
                                .then( function () {
                                    deferred.resolve( userJSON );
                                } )
                                .fail( deferred.reject );
                        } )
                        .error( deferred.reject );
                } )
                .error( deferred.reject );

            return deferred.promise;
        },

        handleRegistrationStep4: function ( account ) {
            var deferred = Q.defer();
            var self = this;

            async.series( [
                function ( cb ) {
                    self
                        .generateAdvancedWorkflow( account )
                        .then( cb )
                        .fail( cb );
                },
                function ( cb ) {
                    self
                        .generateSimpleWorkflow( account )
                        .then( cb )
                        .fail( cb );
                }
            ],
                function ( err, results ) {
                    if ( err ) {
                        deferred.reject();
                    } else {
                        deferred.resolve();
                    }
                } );

            return deferred.promise;
        },

        generateAdvancedWorkflow: function ( account ) {
            var deferred = Q.defer();

            ORMWorkflowModel
                .create( {
                    name: 'Advanced Workflow',
                    type: 'Applicant',
                    defaultWorkflow: true,
                    isEditable: false,
                    AccountId: account.id
                } )
                .success( this.proxy( 'generateAdvancedWorkflowSteps', account, deferred ) )
                .error( deferred.reject );

            return deferred.promise;
        },
        
        generateSimpleWorkflow: function ( account ) {
            var deferred = Q.defer();

            ORMWorkflowModel
                .create( {
                    name: 'Simple Workflow',
                    type: 'Applicant',
                    defaultWorkflow: false,
                    isEditable: false,
                    AccountId: account.id
                } )
                .success( this.proxy( 'generateSimpleWorkflowSteps', account, deferred ) )
                .error( deferred.reject );

            return deferred.promise;
        },
        
        generateAdvancedWorkflowSteps: function ( account, deferred, workflow ) {
            var defaultSteps = [];

            defaultSteps.push( {
                name: 'Filed for Later',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Reviewed',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Phone Screened',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Scheduling Interview',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Interview Scheduled',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Interviewed',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Checking References',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Put On Hold',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Made Offer',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Hired Full Time',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Hired Part Time',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Interned',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Contracted',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Not a Fit',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Declined Offer',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Not Qualified',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Over Qualified',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Location',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Hired Elsewhere',
                statusType: 'Not-Hired'
            } );

            async.forEach(
                defaultSteps,
                this.proxy( 'createWorkflowStep', workflow ),
                function ( err ) {
                    deferred.resolve();
                }
            );
        },
        
        generateSimpleWorkflowSteps: function ( account, deferred, workflow ) {
            var defaultSteps = [];

            defaultSteps.push( {
                name: 'Scheduling Interview',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Interview Scheduled',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Interviewed',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Checking References',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Made Offer',
                statusType: 'Active'
            } );

            defaultSteps.push( {
                name: 'Hired Full Time',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Hired Part Time',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Interned',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Contracted',
                statusType: 'Hired'
            } );

            defaultSteps.push( {
                name: 'Not a Fit',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Declined Offer',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Not Qualified',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Over Qualified',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Location',
                statusType: 'Not-Hired'
            } );

            defaultSteps.push( {
                name: 'Hired Elsewhere',
                statusType: 'Not-Hired'
            } );

            async.forEach(
                defaultSteps,
                this.proxy( 'createWorkflowStep', workflow ),
                function ( err ) {
                    deferred.resolve();
                }
            );
        },

        createWorkflowStep: function ( workflow, step, callback ) {

            ORMWorkflowStepsModel.create( {
                name: step.name,
                statusType: step.statusType,
                WorkflowId: workflow.id
            } )
                .success( callback )
                .error( callback );
        },

        generateRegistrationHash: function ( ua, secretKey ) {

            var deferred = Q.defer()
              , hash, md5
              , createdAt = (ua.account) ? ua.account.createdAt : ua.createdAt
              , updatedAt = (ua.account) ? ua.account.updatedAt : ua.updatedAt
              , subdomain = (ua.account) ? ua.account.subdomain : ua.subdomain;

            console.log( 'Generating hash with secretKey:', secretKey, 'createdAt: ', createdAt, subdomain, 'account_verify' );

            md5 = crypto.createHash( 'md5' );
            md5.update( secretKey + createdAt + subdomain + 'account_verify', 'utf8' );
            hash = md5.digest( 'hex' );

            deferred.resolve( hash );

            return deferred.promise;
        },

        mailRegistrationCode: function ( ua, token ) {
            var mailer = sendgrid( config.sendgrid )
              , bakeTemplate = ejsFileRender()
              , link = config.hosturl + '/registration_confirm/' + ua.AccountId + '/' + token

            var payload = {
                to: ua.email,
                from: 'no-reply@bolthr.com',
                subject: 'Account Activation Action',
                link: link,
                text: 'Please click on the link below to activate your account\n  ' + link
            };

            var info = {
                link: link,
                firstname: ua.firstname,
                companyLogo: 'http://app.bolthr.com/images/logo.png',
                companyName: 'BoltHR',
                tplTitle: 'BoltHR: Account Activation',
                tplName: 'accountActivation'
            };

            return bakeTemplate( info )
                .then( function ( html ) {

                    payload['html'] = html;

                    return mailer( payload );
                } )
                .then( function () {
                    return 'Account created succefully';
                } );
        },

        //Public Function
        getAccountById: function ( accId ) {
            var deferred = Q.defer();

            this
                .findOne( { where: { id: accId, Active: true }, attributes: ['id', 'info', 'name', 'subdomain', 'logo', 'themeColor', 'emailFwd', 'hrEmail', 'companyUrl', 'showMap'] } )
                .then( function ( account ) {
                    if ( !account ) {
                        return deferred.resolve( {} );
                    }

                    deferred.resolve( account );
                } )
                .fail( deferred.resolve );

            return deferred.promise;
        }
    } );

    AccountService.instance = new AccountService( sequelize );
    AccountService.Model = ORMAccountModel;

    return AccountService.instance;
};