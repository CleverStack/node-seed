<a name="ModuleLoader"></a>
#class: ModuleLoader
CleverStack Module Class

**Extends**: `Class`  
**Members**

* [class: ModuleLoader](#ModuleLoader)
  * [ModuleLoader.instance](#ModuleLoader.instance)
  * [moduleLoader.modules](#ModuleLoader#modules)
  * [moduleLoader.modulesLoaded](#ModuleLoader#modulesLoaded)
  * [moduleLoader.modulesLoading](#ModuleLoader#modulesLoading)
  * [moduleLoader.routesInitialized](#ModuleLoader#routesInitialized)
  * [moduleLoader.hookOrder](#ModuleLoader#hookOrder)
  * [ModuleLoader.getInstance(env)](#ModuleLoader.getInstance)
  * [moduleLoader.shutdown()](#ModuleLoader#shutdown)
  * [moduleLoader.preShutdownHook(module)](#ModuleLoader#preShutdownHook)
  * [moduleLoader.moduleIsEnabled(moduleName)](#ModuleLoader#moduleIsEnabled)
  * [moduleLoader.loadModules(env, modules)](#ModuleLoader#loadModules)
  * [event: "modulesLoaded"](#ModuleLoader.event_modulesLoaded)
  * [event: "routesInitialized"](#ModuleLoader.event_routesInitialized)

<a name="ModuleLoader.instance"></a>
##ModuleLoader.instance
A reference to the singleton instance of the moduleLoader

**Type**: `ModuleLoader.prototype`  
<a name="ModuleLoader#modules"></a>
##moduleLoader.modules
All the modules that have been loaded/referenced

**Type**: `Array`  
**Default**: `[]`  
<a name="ModuleLoader#modulesLoaded"></a>
##moduleLoader.modulesLoaded
Have modules been loaded?

**Type**: `Boolean`  
**Default**: `false`  
<a name="ModuleLoader#modulesLoading"></a>
##moduleLoader.modulesLoading
Are modules currently loading?

**Type**: `Boolean`  
**Default**: `false`  
<a name="ModuleLoader#routesInitialized"></a>
##moduleLoader.routesInitialized
Have routes already been initialized

**Type**: `Boolean`  
**Default**: `false`  
<a name="ModuleLoader#hookOrder"></a>
##moduleLoader.hookOrder
An array containing hooks in the order they need to be fired in

**Type**: `Array`  
<a name="ModuleLoader.getInstance"></a>
##ModuleLoader.getInstance(env)
Singleton instance getter, this will create a new instance if one doesn't already exist

**Params**

- env `Object` - The environment object as defined in the bootstrapEnv util (utils.bootstrapEnv)  

**Returns**: `ModuleLoader.prototype`  
<a name="ModuleLoader#shutdown"></a>
##moduleLoader.shutdown()
Tell all the modules (and their dependencies) that we want to shutdown.

**Returns**: `undefined`  
<a name="ModuleLoader#preShutdownHook"></a>
##moduleLoader.preShutdownHook(module)
Helper function to call the preShutdown Event Hook for a module

**Params**

- module `Module` - the module to run the hook on  

**Returns**: `undefined`  
<a name="ModuleLoader#moduleIsEnabled"></a>
##moduleLoader.moduleIsEnabled(moduleName)
Simple helper to tell you if a module is enabled, using its name as a reference.

**Params**

- moduleName `String` - the name of the module  

**Returns**: `Boolean`  
<a name="ModuleLoader#loadModules"></a>
##moduleLoader.loadModules(env, modules)
Load all the modules as provided with the modules argument, or use this.modules

**Params**

- env `Object` - the env object as defined by utils.bootstrapEnv  
- modules `Array` - the modules you want to load, if not specified load what's available at this.modules  

**Returns**: `undefined`  
<a name="ModuleLoader.event_modulesLoaded"></a>
##event: "modulesLoaded"
modulesLoaded event.

<a name="ModuleLoader.event_routesInitialized"></a>
##event: "routesInitialized"
routesInitialized event.

