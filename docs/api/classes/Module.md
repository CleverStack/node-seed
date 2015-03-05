<a name="Module"></a>
#class: Module
CleverStack Module Class

**Extends**: `Class`  
**Members**

* [class: Module](#Module)
  * [Module.moduleFolders](#Module.moduleFolders)
  * [Module.injectableFolders](#Module.injectableFolders)
  * [Module.excludedFiles](#Module.excludedFiles)
  * [module.name](#Module#name)
  * [module.config](#Module#config)
  * [module.path](#Module#path)
  * [module.pkg](#Module#pkg)
  * [module.paths](#Module#paths)
  * [module.extend(Static, Proto)](#Module#extend)
  * [module.setup(_name, _path, _pkg)](#Module#setup)
  * [module.loadResources()](#Module#loadResources)
  * [module.inspectPathForResources(pathToInspect, callback)](#Module#inspectPathForResources)
  * [module.addResource(pathToInspect, file, callback)](#Module#addResource)
  * [module.resourcesLoaded()](#Module#resourcesLoaded)
  * [module.addFolderToPath(hookName)](#Module#addFolderToPath)
  * [module.hook(hookName)](#Module#hook)
  * [module.initRoutes()](#Module#initRoutes)
  * [event: "extend"](#Module.event_extend)
  * [event: "preSetup"](#Module.event_preSetup)
  * [event: "preInit"](#Module.event_preInit)
  * [event: "resourcesLoaded"](#Module.event_resourcesLoaded)

<a name="Module.moduleFolders"></a>
##Module.moduleFolders
The default module folders to load resources from

**Type**: `Array`  
<a name="Module.injectableFolders"></a>
##Module.injectableFolders
Which of the Module.moduleFolders can use injector.inject() for loading

**Type**: `Array`  
<a name="Module.excludedFiles"></a>
##Module.excludedFiles
Which of the files inside of Module.moduleFolders should be explicitly ignore

**Type**: `Array`  
<a name="Module#name"></a>
##module.name
The name of this service

**Type**: `String`  
<a name="Module#config"></a>
##module.config
The configuration of this module, as loaded via require('config')[moduleName]

**Type**: `Object`  
<a name="Module#path"></a>
##module.path
The resolved path to the module

**Type**: `String`  
<a name="Module#pkg"></a>
##module.pkg
The contents of the JSON inside this modules/module/package.json

**Type**: `Object`  
<a name="Module#paths"></a>
##module.paths
A list of existing paths that are build in Module#setup

**Type**: `Array`  
<a name="Module#extend"></a>
##module.extend(Static, Proto)
Extends the Module class with new static and prototype functions, there are a variety of ways to use extend.
  // with static and prototype
  Module.extend({ STATIC },{ PROTOTYPE })
   
  // with just classname and prototype functions
  Module.extend({ PROTOTYPE })

**Params**

- Static `Object` - the new Modules static properties/functions  
- Proto `Object` - the new Modules prototype properties/functions  

**Returns**: [Module](#Module)  
<a name="Module#setup"></a>
##module.setup(_name, _path, _pkg)
An override setup function for Module

**Params**

- _name `String` - The name of the service  
- _path `String` - The path of this module  
- _pkg `Object` - The contents of this modules package.json file  

**Returns**: `Arary`  
<a name="Module#loadResources"></a>
##module.loadResources()
Used to load the resources (files, classes, configuration, etc...) for this module

**Returns**: `undefined`  
<a name="Module#inspectPathForResources"></a>
##module.inspectPathForResources(pathToInspect, callback)
Helper function that inspects the given path for resources to load

**Params**

- pathToInspect `String` - the path to inspect  
- callback `function` - callback for async  

**Returns**: `undefined`  
<a name="Module#addResource"></a>
##module.addResource(pathToInspect, file, callback)
Helper function to load a module resource and add it to this module.

**Params**

- pathToInspect `String` - the path to the resource  
- file `String` - the filename of the resource  
- callback `function` - callback for async  

**Returns**: `undefined`  
<a name="Module#resourcesLoaded"></a>
##module.resourcesLoaded()
Fires the resourcesLoaded event with any errors raised during loading

**Returns**: `undefined`  
<a name="Module#addFolderToPath"></a>
##module.addFolderToPath(hookName)
A helper function to add a folder to this.paths

**Params**

- hookName `String` - the name of the hook function to run  

**Returns**: `undefined`  
<a name="Module#hook"></a>
##module.hook(hookName)
A helper function to run a hook on a module, it that hook function exists

**Params**

- hookName `String` - the name of the hook function to run  

**Returns**: `undefined`  
<a name="Module#initRoutes"></a>
##module.initRoutes()
Default implementation of the initRoutes hook for this module, you can override this if you need

**Returns**: `undefined`  
<a name="Module.event_extend"></a>
##event: "extend"
extend event.

**Type**: [Module](#Module)  
<a name="Module.event_preSetup"></a>
##event: "preSetup"
preSetup event.

**Type**: [Module](#Module)  
<a name="Module.event_preInit"></a>
##event: "preInit"
preInit event.

**Type**: [Module](#Module)  
<a name="Module.event_resourcesLoaded"></a>
##event: "resourcesLoaded"
resourcesLoaded event.

**Type**: [Module](#Module)  
