var Class = require('uberclass')
  , async = require('async')
  , MemCached = require('memcached')
  , moment = require('moment');

module.exports = Class.extend(
    {

    },
    {
        isMaster: null,

        isMasterScanning: null,

        masterKey: null,

        serverKey: null,

        memcache: null,

        interval: null,

        init: function() {
            this.isMaster = false;
            this.isMasterScanning = false;
            this.masterKey = process.env.NODE_ENV + '_backgroundTasks';
            this.serverKey = Date.now() + Math.floor(Math.random()*1001); // @TODO - implement storing the server key in /tmp/serverKey
            this.memcache = new MemCached( config.memcacheHost )
            this.interval = setInterval( this.proxy( 'masterLoop' ), 15000 );
            this.masterLoop();
        },

        masterLoop: function() {
            if ( this.isMasterScanning === false ) {
                this.isMasterScanning = true;

                if ( this.isMaster !== true ) {
                    this.getMasterLock();
                } else {
                    this.runMasterTasks();
                }

            } else {
                this.holdMasterLock();
                console.log('already scanning');
            }
        },

        getMasterLock: function() {
            this.memcache.gets( this.masterKey, this.proxy('handleGetMasterLock') );
        },

        handleGetMasterLock: function( err, result ) {
            if ( err ) {
                console.error( 'Unable to gets the lock from memcache. Err:' + err + ' Result:' + result );
                this.isMasterScanning = false;
            } else if ( result === false ) {
                this.memcache.add( this.masterKey, this.serverKey, 30, function( addErr, addResult ) {
                    if ( addResult && !addErr ) {
                        console.log( 'Got master lock.' );
                        this.isMaster = true;
                        this.runMasterTasks();
                    } else {
                        console.error( 'Unable to add the lock key into memcache. Err:' + addErr + ' Result:' + addResult );
                        this.isMasterScanning = false;
                    }
                }.bind(this));
            } else {
                if ( result && result[this.masterKey] === this.serverKey ) {
                    console.log( 'Discovered that im the master.' );
                    this.isMaster = true;
                    this.runMasterTasks();
                } else {
                    console.log( 'There is already a master holding the lock!' );
                    this.isMasterScanning = false;
                }
            }
        },

        holdMasterLock: function() {
            if ( this.isMaster ) {
                this.memcache.gets( this.masterKey, function( err, result ) {
                    if ( !err && result && result.cas ) {
                        this.memcache.cas( this.masterKey, this.serverKey, result.cas, 30, function( casErr, casResult ) {
                            if ( casErr ) {
                                console.log( 'Cannot hold onto master lock.' );
                            } else {
                                console.log( 'Held onto master lock.');
                            }
                        }.bind( this ));
                    }
                }.bind( this ));
            }
        },

        // should go to memcache to try and keep a key using CAS (should check the value matches the randomly generated master id of this process)
        runMasterTasks: function() {
            this.holdMasterLock();

            console.log( 'Run master tasks.' );
            async.parallel(
                [
                    // this.proxy( 'sendNotifications' ),
                    // this.proxy( 'generateBookings' ),
                    // this.proxy( 'sendMessages' ),
                    // this.proxy( 'sendRequests' ),
                    // this.proxy( 'processRequests' )
                ],
                this.proxy( 'runMasterTasksComplete' )
            );
        },

        runMasterTasksComplete: function( err ) {
            console.log( 'runMasterTasksComplete', err );
            if ( err ) {
                console.dir(err.stack);
            }

            this.isMasterScanning = false;
        }
    });