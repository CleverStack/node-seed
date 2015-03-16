var UberClass    = require('uberclass')
  , EventEmitter = require('events').EventEmitter
  , Prototype    = Object.create(EventEmitter.prototype)
  , Static       = Object.create(EventEmitter.prototype)
  , Class;

/**
 * Extends a class with new static and prototype functions, there are a variety of ways to use extend.
 *   // with static and prototype
 *   Class.extend({ STATIC },{ PROTOTYPE })
 *    
 *   // with just classname and prototype functions
 *   Class.extend({ PROTOTYPE })
 *
 * @function Class.extend
 * @param  {Object} Static the new classes static properties/functions
 * @param  {Object} Proto  the new classes prototype properties/functions
 * @return {Class}
 */
Static.extend = function(Static, Proto) {
  Static = typeof Proto !== undefined ? Static : {};
  EventEmitter.call(Static);
  var Klss = this._super ? this._super.apply(this, arguments) : arguments;
  Klss.setMaxListeners(0);

  /**
   * extend event.
   *
   * @event Class.extend
   * @type {Class}
   */
  Klss.emit('extend', Klss);

  return Klss;
};

/**
 * Emit an event of a specific type.  This will notify (invoke) each of the
 * listeners in order with any the given arguments.
 * 
 * @function Class.emit
 * @param {String} type The type of event to emit
 * @param args Any additional arguments that should be passed to the listeners
 * @example
 * Class.emit('init');
 */

/**
 * Add a listener to this event emitter.  The listener will be called back
 * the next time someone emits an event of the type specified by the
 * <code>type</code> parameter.
 * 
 * @function Class.on
 * @param {String} type the type of events the listener is interested in
 * @param {Function} listener the callback function that will be invoked when the event is emitted
 * @param {Boolean} {once=false} true if the listener should only
 *    be notified for the first event, false if the listener should
 *    be notified for all events.
 * @example
 * Class.on('init', function() {
 *   // will be called everytime the "init" event is fired/emitted
 * });
 */

/**
 * Adds a one time listener for the <code>Event</code>. This listener is
 * invoked only the next time the event is fired, after which it is removed.
 * 
 * @function Class.once
 * @param {String} type - type of the listener.
 * @param {Function} listener - the listener
 * @example
 * Class.once('init', function() {
 *   // will be called only for the first time the "init" event is fired/emitted
 * });
 */

/**
 * Add a listener which will be called back. An alias for the <code>on()</code> function.
 * 
 * @function
 * @example Class.addListener
 * Class.addListener('init', function() {
 *   // will be called everytime the "init" event is fired/emitted
 * });
 */

/**
 * Stops a specified listener from receiving further events.
 * 
 * @function Class.removeListener
 * @param {String} type type of the listener
 * @param {Function} listener the listener
 * @example
 * Class.removeListener('init', listener);
 */

/**
 * Removes all the listeners that are listening for a specific type
 * of event.  Care should be taken not to disrupt other plug-ins
 * when calling this on shared event emitters that you do not control
 * yourself, for example the ones provided by Content Studio.
 * 
 * @function Class.removeAllListeners
 * @param {String} type the type of events that all listeners should be removed.
 * @example
 * Class.removeAllListeners('init');
 */

/** 
 * If a setup method is provided, it is called when a new instances is created. It gets 
 * passed the same arguments that were given to the Class constructor function, if
 * setup returns an array, those arguments will be used for init.
 *
 * It's important to call the parents super constructor function by using this._super, as this is
 * where the EventEmitter is called.
 * 
 * Also something to remember, if you return a closure (even binded or proxied), make sure to grab a reference to this.super because
 * after the execution of the function your in (that returns a closure), this._super is cleared or set to something else.
 * 
 * @example
 * var MyClass = Class.extend(
 * {
 *   setup: function(val) {
 *     this.val = val;
 *     return this._super.apply(this, arguments);
 *   }
 * });
 * var myInstance = new MyClass('Awesome');
 *
 * myInstance.val //-> 'Awesome'
 * @exampleend
 * 
 * @function Class#setup
 * @return {Array|undefined} If an array is returned, Class#.init is 
 * called with those arguments; otherwise, the original arguments are used.
 */
Prototype.setup = function() {
  EventEmitter.call(this);
  this.setMaxListeners(0);

  /**
   * setup event.
   *
   * @event Class#setup
   * @type {object}
   * @property {arguments} args - The arguments passed to Class#setup
   */
  this.emit('setup', {
    args: arguments
  });

  // return this._super ? this._super.apply(this, arguments) : arguments;
};

/** 
 * If an <code>init</code> method is provided, it gets called when a new instance
 * is created.  Init gets called after [Class.prototype.setup setup], typically with the 
 * same arguments passed to the Class 
 * constructor: (<code> new Class( arguments ... )</code>).  
 *
 * Note: Class#setup is able to modify the arguments passed to init.
 *
 * @function Class#init
 * @example
 * var MyClass = Class.extend(
 * {
 *   setup: function(val) {
 *     this.val = val;
 *     return this._super.apply(this, arguments);
 *   }
 * });
 * var myInstance = new MyClass(1);
 *
 * myInstance.val //-> 1
 * @exampleend
 * @function Class#init
 */
Prototype.init = function() {
  /**
   * init event.
   *
   * @event Class#init
   * @type {object}
   * @property {arguments} args - The arguments passed to Class#init
   */
  this.emit('init', {
    args: arguments
  });

  return this._super ? this._super.apply(this, arguments) : this;
};

/**
 * Emit an event of a specific type.  This will notify (invoke) each of the
 * listeners in order with any the given arguments.
 * 
 * @function Class#emit
 * @param {String} type The type of event to emit
 * @param args Any additional arguments that should be passed to the listeners
 * @example
 * Class.emit('init');
 */

/**
 * Add a listener to this event emitter.  The listener will be called back
 * the next time someone emits an event of the type specified by the
 * <code>type</code> parameter.
 * 
 * @function Class#on
 * @param {String} type the type of events the listener is interested in
 * @param {Function} listener the callback function that will be invoked when the event is emitted
 * @param {Boolean} {once=false} true if the listener should only
 *    be notified for the first event, false if the listener should
 *    be notified for all events.
 * @example
 * Class.on('init', function() {
 *   // will be called everytime the "init" event is fired/emitted
 * });
 */

/**
 * Adds a one time listener for the <code>Event</code>. This listener is
 * invoked only the next time the event is fired, after which it is removed.
 * 
 * @function Class#once
 * @param {String} type - type of the listener.
 * @param {Function} listener - the listener
 * @example
 * Class.once('init', function() {
 *   // will be called only for the first time the "init" event is fired/emitted
 * });
 */

/**
 * Add a listener which will be called back. An alias for the <code>on()</code> function.
 * 
 * @function Class#addListener
 * @example
 * Class.addListener('init', function() {
 *   // will be called everytime the "init" event is fired/emitted
 * });
 */

/**
 * Stops a specified listener from receiving further events.
 * 
 * @function Class#removeListener
 * @param {String} type type of the listener
 * @param {Function} listener the listener
 * @example
 * Class.removeListener('init', listener);
 */

/**
 * Removes all the listeners that are listening for a specific type
 * of event.  Care should be taken not to disrupt other plug-ins
 * when calling this on shared event emitters that you do not control
 * yourself, for example the ones provided by Content Studio.
 * 
 * @function Class#removeAllListeners
 * @param {String} type the type of events that all listeners should be removed.
 * @example
 * Class.removeAllListeners('init');
 */

/**
 * @class     Class
 * @classdesc CleverStack's base Class
 */
Class = UberClass.extend(Static, Prototype);

module.exports = Class;
