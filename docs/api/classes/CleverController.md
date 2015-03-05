<a name="CleverController"></a>
#class: CleverController
Clever Controller - lightning-fast flexible controller prototype

**Members**

* [class: CleverController](#CleverController)
  * [CleverController.route](#CleverController.route)
  * [CleverController.autoRouting](#CleverController.autoRouting)
  * [CleverController.actionRouting](#CleverController.actionRouting)
  * [CleverController.restfulRouting](#CleverController.restfulRouting)
  * [cleverController.req](#CleverController#req)
  * [cleverController.res](#CleverController#res)
  * [cleverController.next](#CleverController#next)
  * [cleverController.action](#CleverController#action)
  * [cleverController.resFunc](#CleverController#resFunc)
  * [CleverController.attach()](#CleverController.attach)
  * [CleverController.setup()](#CleverController.setup)
  * [CleverController.autoRoute(app)](#CleverController.autoRoute)
  * [CleverController.extend()](#CleverController.extend)
  * [cleverController.performanceSafeSetup(req, res, next)](#CleverController#performanceSafeSetup)
  * [cleverController.init(error, method, next)](#CleverController#init)

<a name="CleverController.route"></a>
##CleverController.route
Defines any (string) route or (array) routes to be used in conjuction with autoRouting

Note:
    You do not need to provide a value for this, if autoRouting is enabled,
    and you haven't defined a route one will be assigned based on the filename of your Controller.

**Type**: `Boolean` | `String` | `Array`  
**Default**: `false`  
<a name="CleverController.autoRouting"></a>
##CleverController.autoRouting
Turns autoRouting on when not set to false, and when set to an array provides an
easy way to define middleware for the controller

**Type**: `Boolean` | `Array`  
**Default**: `true`  
<a name="CleverController.actionRouting"></a>
##CleverController.actionRouting
Turns action based routing on or off

**Type**: `Boolean`  
**Default**: `true`  
<a name="CleverController.restfulRouting"></a>
##CleverController.restfulRouting
Turns restful method based routing on or off

**Type**: `Boolean`  
**Default**: `true`  
<a name="CleverController#req"></a>
##cleverController.req
The Request Object

**Type**: `Request`  
<a name="CleverController#res"></a>
##cleverController.res
The Response Object

**Type**: `Response`  
<a name="CleverController#next"></a>
##cleverController.next
The next function provided by connect, used to continue past this controller

**Type**: `function`  
<a name="CleverController#action"></a>
##cleverController.action
Is set to the most recent action function that was called

**Type**: `String`  
<a name="CleverController#resFunc"></a>
##cleverController.resFunc
The name of the default Response handler function

**Type**: `String`  
**Default**: `'json'`  
<a name="CleverController.attach"></a>
##CleverController.attach()
Use this function to attach your controller's to routes (either express or restify are supported)

**Returns**: `function` - returns constructor function  
<a name="CleverController.setup"></a>
##CleverController.setup()
Class (Static) constructor

**Returns**: `undefined`  
<a name="CleverController.autoRoute"></a>
##CleverController.autoRoute(app)
Attaches controllers routes to the app if autoRouting is enabled and routes have been defined

**Params**

- app `Object` - Either express.app or restify  

**Returns**: `undefined`  
<a name="CleverController.extend"></a>
##CleverController.extend()
Use this function to create a new controller that extends from Controller

**Returns**: `Controller` - the newly created controller class  
<a name="CleverController#performanceSafeSetup"></a>
##cleverController.performanceSafeSetup(req, res, next)
This is effectively what would be in setup() but instead lives here outside of the try/catch
so google v8 can optimise the code within

**Params**

- req `Request` - the Request Object  
- res `Response` - the Response Object  
- next `function` - connects next() function  

**Returns**: `Array` - arguments that will be passed to init() to complete the constructor loop  
<a name="CleverController#init"></a>
##cleverController.init(error, method, next)
The final function in the constructor routine, called eventually after setup() has finished

**Params**

- error `Error` - any errors encountered during the setup() portion of the constructor  
- method `String` - the name of the method to call on this controller  
- next `function` - connects next() function  

**Returns**: `undefined`  
