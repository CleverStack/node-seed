<a name="Class"></a>
#class: Class
CleverStack's base Class

**Members**

* [class: Class](#Class)
  * [Class.emit(type, args)](#Class.emit)
  * [Class.on(type, listener, {once=false})](#Class.on)
  * [Class.once(type, listener)](#Class.once)
  * [Class.removeListener(type, listener)](#Class.removeListener)
  * [Class.removeAllListeners(type)](#Class.removeAllListeners)
  * [class.emit(type, args)](#Class#emit)
  * [class.on(type, listener, {once=false})](#Class#on)
  * [class.once(type, listener)](#Class#once)
  * [class.addListener()](#Class#addListener)
  * [class.removeListener(type, listener)](#Class#removeListener)
  * [class.removeAllListeners(type)](#Class#removeAllListeners)
  * [Class.extend(Static, Proto)](#Class.extend)
  * [class.setup()](#Class#setup)
  * [class.init()](#Class#init)
  * [event: "extend"](#Class.event_extend)
  * [event: "setup"](#Class#event_setup)
  * [event: "init"](#Class#event_init)

<a name="Class.emit"></a>
##Class.emit(type, args)
Emit an event of a specific type.  This will notify (invoke) each of the
listeners in order with any the given arguments.

**Params**

- type `String` - The type of event to emit  
- args  - Any additional arguments that should be passed to the listeners  

**Example**  
Class.emit('init');

<a name="Class.on"></a>
##Class.on(type, listener, {once=false})
Add a listener to this event emitter.  The listener will be called back
the next time someone emits an event of the type specified by the
<code>type</code> parameter.

**Params**

- type `String` - the type of events the listener is interested in  
- listener `function` - the callback function that will be invoked when the event is emitted  
- {once=false} `Boolean` - true if the listener should only
   be notified for the first event, false if the listener should
   be notified for all events.  

**Example**  
Class.on('init', function() {
  // will be called everytime the "init" event is fired/emitted
});

<a name="Class.once"></a>
##Class.once(type, listener)
Adds a one time listener for the <code>Event</code>. This listener is
invoked only the next time the event is fired, after which it is removed.

**Params**

- type `String` - type of the listener.  
- listener `function` - the listener  

**Example**  
Class.once('init', function() {
  // will be called only for the first time the "init" event is fired/emitted
});

<a name="Class.removeListener"></a>
##Class.removeListener(type, listener)
Stops a specified listener from receiving further events.

**Params**

- type `String` - type of the listener  
- listener `function` - the listener  

**Example**  
Class.removeListener('init', listener);

<a name="Class.removeAllListeners"></a>
##Class.removeAllListeners(type)
Removes all the listeners that are listening for a specific type
of event.  Care should be taken not to disrupt other plug-ins
when calling this on shared event emitters that you do not control
yourself, for example the ones provided by Content Studio.

**Params**

- type `String` - the type of events that all listeners should be removed.  

**Example**  
Class.removeAllListeners('init');

<a name="Class#emit"></a>
##class.emit(type, args)
Emit an event of a specific type.  This will notify (invoke) each of the
listeners in order with any the given arguments.

**Params**

- type `String` - The type of event to emit  
- args  - Any additional arguments that should be passed to the listeners  

**Example**  
Class.emit('init');

<a name="Class#on"></a>
##class.on(type, listener, {once=false})
Add a listener to this event emitter.  The listener will be called back
the next time someone emits an event of the type specified by the
<code>type</code> parameter.

**Params**

- type `String` - the type of events the listener is interested in  
- listener `function` - the callback function that will be invoked when the event is emitted  
- {once=false} `Boolean` - true if the listener should only
   be notified for the first event, false if the listener should
   be notified for all events.  

**Example**  
Class.on('init', function() {
  // will be called everytime the "init" event is fired/emitted
});

<a name="Class#once"></a>
##class.once(type, listener)
Adds a one time listener for the <code>Event</code>. This listener is
invoked only the next time the event is fired, after which it is removed.

**Params**

- type `String` - type of the listener.  
- listener `function` - the listener  

**Example**  
Class.once('init', function() {
  // will be called only for the first time the "init" event is fired/emitted
});

<a name="Class#addListener"></a>
##class.addListener()
Add a listener which will be called back. An alias for the <code>on()</code> function.

**Example**  
Class.addListener('init', function() {
  // will be called everytime the "init" event is fired/emitted
});

<a name="Class#removeListener"></a>
##class.removeListener(type, listener)
Stops a specified listener from receiving further events.

**Params**

- type `String` - type of the listener  
- listener `function` - the listener  

**Example**  
Class.removeListener('init', listener);

<a name="Class#removeAllListeners"></a>
##class.removeAllListeners(type)
Removes all the listeners that are listening for a specific type
of event.  Care should be taken not to disrupt other plug-ins
when calling this on shared event emitters that you do not control
yourself, for example the ones provided by Content Studio.

**Params**

- type `String` - the type of events that all listeners should be removed.  

**Example**  
Class.removeAllListeners('init');

<a name="Class.extend"></a>
##Class.extend(Static, Proto)
Extends a class with new static and prototype functions, there are a variety of ways to use extend.
  // with static and prototype
  Class.extend({ STATIC },{ PROTOTYPE })
   
  // with just classname and prototype functions
  Class.extend({ PROTOTYPE })

**Params**

- Static `Object` - the new classes static properties/functions  
- Proto `Object` - the new classes prototype properties/functions  

**Returns**: [Class](#Class)  
<a name="Class#setup"></a>
##class.setup()
If a setup method is provided, it is called when a new instances is created. It gets 
passed the same arguments that were given to the Class constructor function, if
setup returns an array, those arguments will be used for init.

It's important to call the parents super constructor function by using this._super, as this is
where the EventEmitter is called.

Also something to remember, if you return a closure (even binded or proxied), make sure to grab a reference to this.super because
after the execution of the function your in (that returns a closure), this._super is cleared or set to something else.

**Returns**: `Array` | `undefined` - If an array is returned, Class#.init is 
called with those arguments; otherwise, the original arguments are used.  
**Example**  
var MyClass = Class.extend(
{
  setup: function(val) {
    this.val = val;
    return this._super.apply(this, arguments);
  }
});
var myInstance = new MyClass('Awesome');

myInstance.val //-> 'Awesome'

<a name="Class#init"></a>
##class.init()
If an <code>init</code> method is provided, it gets called when a new instance
is created.  Init gets called after [Class.prototype.setup setup], typically with the 
same arguments passed to the Class 
constructor: (<code> new Class( arguments ... )</code>).  

Note: Class#setup is able to modify the arguments passed to init.

**Example**  
var MyClass = Class.extend(
{
  setup: function(val) {
    this.val = val;
    return this._super.apply(this, arguments);
  }
});
var myInstance = new MyClass(1);

myInstance.val //-> 1

<a name="Class.event_extend"></a>
##event: "extend"
extend event.

**Type**: [Class](#Class)  
<a name="Class#event_setup"></a>
##event: "setup"
setup event.

**Properties**

- args `arguments` - The arguments passed to Class#setup  

**Type**: `object`  
<a name="Class#event_init"></a>
##event: "init"
init event.

**Properties**

- args `arguments` - The arguments passed to Class#init  

**Type**: `object`  
