var Class = require( 'uberclass' )
  , async = require( 'async' )
  , MemCached = require( 'memcached' )
  , moment = require( 'moment' )
  , tasks = require( 'tasks' )
  , debug = require( 'debug' )( 'BackgroundTasks');

module.exports = Class.extend(
{

},
{
    isMaster: null,

    masterTasksAreRunning: null,

    nonMastermasterTasksAreRunning: null,

    masterKey: null,

    serverKey: null,

    memcache: null,

    interval: null,

    tasksToRun: {
        master: [],
        nomaster: []
    },

    init: function() {
        debug( 'Constructor called' );
        this.isMaster = false;
        this.masterTasksAreRunning = false;
        this.nonMastermasterTasksAreRunning = false;
        this.masterKey = process.env.NODE_ENV + '_backgroundTasks';
        this.serverKey = Date.now() + Math.floor(Math.random()*1001); // @TODO - implement storing the server key in /tmp/serverKey
        this.memcache = new MemCached( config[ 'background-tasks' ].memcache.host )

        //Process Messages coming from the cluster
        process.on('message', this.proxy('handleMessage'));

        // Setup and get processing
        this.setupTasksAndStartMasterLoop();
    },

    setupTasksAndStartMasterLoop : function( ){
        async.series([
            this.proxy( 'setupBackgroundTasks' ),
            this.proxy( 'initMainLoop' )
        ]);
    },

    setupBackgroundTasks : function( callback ){
        debug( "Checking which tasks needs to run where" );
        var t = null
          , cbt = config[ 'background-tasks' ];

        if( cbt.enabled ){
            async.forEach(
                cbt.tasks,
                this.proxy( 'prepareTask', cbt, t ),
                callback
            );
        } else {
            callback(null);
        }
    },

    prepareTask: function( cbt, t, item, callback ) {
        var key = ( item.masterOnly && item.masterOnly === true ) ? 'master' : 'nomaster';
        if( tasks[ item.name ] !== undefined ){
            var taskClassName = item.name

             // Wrap each class in a function that creates a new instance of that class with the required callback so we can do
             // async.parallel( this.tasksToRun.master, callback);
             this.tasksToRun[ key ].push( function( callback ) {
                new ( tasks[ taskClassName ] )( callback );
             }); 
        };

        callback( null );
    },

    initMainLoop: function(  callback ){
        debug( "Initiate Main Loop" );
        this.interval = setInterval( this.proxy( 'mainLoop' ), config[ 'background-tasks' ].interval );
        callback(null);
    },

    handleMessage: function( msg ){
        // @TODO this needs to be refactored so it works, right now its not actually active or used
        debug( 'Message from worker' );
        var taskObj;
        var m = { 
            type   : 'error'
        ,   result : 'invalid'
        ,   wrkid  : ( !msg.wrkid ) ? null : msg.wrkid
        ,   pid    : process.pid
        };
        
        if( this.tasksToRun !== null ){
            if( config[ 'background-tasks' ].on ){
                var l = config[ 'background-tasks' ].tasks.length, item;

                while ( l-- ) {
                    item = config[ 'background-tasks' ].tasks[ l ];
                    if( ( item.name == msg.task ) && ( tasks[ item.name ] !== undefined ) ){
                         taskObj = tasks[ item.name ];
                    };
                };
            }

        }

        if( taskObj ){
            taskObj.startTask(function( err, result ){
                
                if( !err ){
                    m['type'] = 'success';
                    m['result'] = result;
                }else{
                    m['type'] = 'error';
                    m['result'] = err;
                }
                
                process.send(m);
            });
        }else{
            process.send(m);
        }
    },

    mainLoop: function() {
        // Handle non master tasks
        if ( this.nonMastermasterTasksAreRunning === false ) {
            this.nonMastermasterTasksAreRunning = true;
            this.runTasks( this.proxy( 'nonMasterTasksAreCompleted' ) );
        } else {
            debug( 'Non master tasks have not finished running yet, waiting for them to finish');
        }

        if ( this.masterTasksAreRunning === false ) {
            this.masterTasksAreRunning = true;

            if ( this.isMaster !== true ) {
                this.getMasterLock();
            } else {
                this.runMainLoop();
            }

        } else {
            this.holdMasterLock();
            debug( 'Master Tasks have not finished running yet, waiting for them to finish');
        }
    },

    runMainLoop: function() {
        debug( 'Running master tasks' );
        
        async.parallel(
            [
                this.proxy( 'runMasterTasks' )//,
                // this.proxy( 'runTasks' )
            ],
            this.proxy( 'tasksAreCompleted' )
        );
    },

    getMasterLock: function() {
        this.memcache.gets( this.masterKey, this.proxy('handleGetMasterLock') );
    },

    handleGetMasterLock: function( err, result ) {
        if ( err ) {
            debug( 'Unable to gets the lock from memcache. Err: %s Result: %s', err, result );
            this.runMainLoop();
        } else if ( result === false ) {
            this.memcache.add( this.masterKey, this.serverKey, ( ( config[ 'background-tasks' ].interval / 100 ) * 2 ), function( addErr, addResult ) {
                if ( addResult && !addErr ) {
                    debug( 'Got master lock.' );
                    this.isMaster = true;
                } else {
                    debug( 'Unable to add the lock key into memcache. Err: %s Result: %s', addErr, addResult );
                }
                this.runMainLoop();

            }.bind(this));
        } else {
            if ( result && result[this.masterKey] === this.serverKey ) {
                debug( 'Discovered that im the master.' );
                this.isMaster = true;
            } else {
                debug( 'There is already a master holding the lock!' );
            }
            
            this.runMainLoop();
        }
    },

    holdMasterLock: function() {
        if ( this.isMaster ) {
            this.memcache.gets( this.masterKey, function( err, result ) {
                if ( !err && result && result.cas ) {
                    this.memcache.cas( this.masterKey, this.serverKey, result.cas, 30, function( casErr, casResult ) {
                        if ( casErr ) {
                            debug( 'Cannot hold onto master lock.' );
                        } else {
                            debug( 'Held onto master lock.');
                        }
                    }.bind( this ));
                }
            }.bind( this ));
        }
    },

    runMasterTasks: function( callback ) {
        if ( this.isMaster === true ) {
            this.holdMasterLock();

            debug( 'Run %s master tasks.', this.tasksToRun.master.length );
            async.parallel(
                this.tasksToRun.master,
                callback
            );
        } else {
            callback( null );
        }
    },

    runTasks : function( callback ){
        debug( 'Run %s non master tasks.', this.tasksToRun.nomaster.length );
        async.parallel(
            this.tasksToRun.nomaster,
            callback
        ); 
    },

    tasksAreCompleted : function( err ){
        debug( 'Master tasks have completed: %s', err );
        if ( err ) {
           debug( err.stack );
        }

        this.masterTasksAreRunning = false;
    },

    nonMasterTasksAreCompleted: function( err ) {
        debug( 'Non master tasks have finished running with error: %s', err );
        this.nonMastermasterTasksAreRunning = false;
    }
});