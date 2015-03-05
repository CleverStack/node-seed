<a name="Controller"></a>
#class: Controller
**Extends**: `CleverController`  
**Members**

* [class: Controller](#Controller)
  * [Controller.app](#Controller.app)
  * [Controller.service](#Controller.service)
  * [controller.getOptionsForService()](#Controller#getOptionsForService)
  * [controller.param(name)](#Controller#param)
  * [controller.processIncludes(findOptions)](#Controller#processIncludes)
  * [controller.handleServiceMessage(response)](#Controller#handleServiceMessage)
  * [controller.listAction()](#Controller#listAction)
  * [controller.getAction()](#Controller#getAction)
  * [controller.postAction()](#Controller#postAction)
  * [controller.putAction()](#Controller#putAction)
  * [controller.deleteAction()](#Controller#deleteAction)

<a name="Controller.app"></a>
##Controller.app
Express Application reference for Controller to autoRoute with

**Type**: `Express`  
<a name="Controller.service"></a>
##Controller.service
A Reference to a service to use with this Controller, to provide automatic CRUD.

**Type**: `Service`  
<a name="Controller#getOptionsForService"></a>
##controller.getOptionsForService()
Helper function that can be used to get the findOptions object for a Service to use with its Model.

**Returns**: `Object` - containing where, limit, offset and includes.  
<a name="Controller#param"></a>
##controller.param(name)
Helper function that can be used to get a param by name first from req.params, then req.body or lastly req.query

**Params**

- name `String` - the name of the param you want the value for  

**Returns**: `Mixed`  
<a name="Controller#processIncludes"></a>
##controller.processIncludes(findOptions)
Helper function that can be used to pre-process includes for findOptions

**Params**

- findOptions `Object` - typically the result of Controller#getOptionsForService  

**Returns**: `Object` - the findOptions  
<a name="Controller#handleServiceMessage"></a>
##controller.handleServiceMessage(response)
Helper function to check the response for Exceptions, Errors and the like.

**Params**

- response `Mixed` - the response that need's to be sent to the user  

<a name="Controller#listAction"></a>
##controller.listAction()
Default Read List CRUD Action, only works if you set Controller.service

<a name="Controller#getAction"></a>
##controller.getAction()
Default Read CRUD Action, only works if you set Controller.service

<a name="Controller#postAction"></a>
##controller.postAction()
Default Create CRUD Action, only works if you set Controller.service

<a name="Controller#putAction"></a>
##controller.putAction()
Default Update CRUD Action, only works if you set Controller.service

<a name="Controller#deleteAction"></a>
##controller.deleteAction()
Default Delete CRUD Action, only works if you set Controller.service

