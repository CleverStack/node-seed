<a name="Model"></a>
#class: Model
CleverStack Model Class

**Extends**: `Class`  
**Members**

* [class: Model](#Model)
  * [new Model(entity)](#new_Model)
  * [Model.defaults](#Model.defaults)
  * [Model.Types](#Model.Types)
  * [Model.validator](#Model.validator)
  * [Model.eventNames](#Model.eventNames)
  * [Model.hasOne(targetModel, options)](#Model.hasOne)
  * [Model.hasMany(targetModel, options)](#Model.hasMany)
  * [Model.belongsTo(targetModel, options)](#Model.belongsTo)
  * [Model.extend(tableName, Static={}, Proto)](#Model.extend)
  * [Model.create(values, queryOptions={})](#Model.create)
  * [Model.find(findOptions={}, queryOptions={})](#Model.find)
  * [Model.findAll(findOptions={}, queryOptions={})](#Model.findAll)
  * [Model.update(values, queryOptions={})](#Model.update)
  * [Model.destroy(queryOptions={})](#Model.destroy)
  * [model.save(queryOptions={})](#Model#save)
  * [model.destroy(queryOptions={})](#Model#destroy)
  * [model.toJSON()](#Model#toJSON)
  * [model.inspect()](#Model#inspect)
  * [event: "beforeCreate"](#Model.event_beforeCreate)
  * [event: "afterCreate"](#Model.event_afterCreate)
  * [event: "beforeAllFindersOptions"](#Model.event_beforeAllFindersOptions)
  * [event: "beforeFindOptions"](#Model.event_beforeFindOptions)
  * [event: "beforeFind"](#Model.event_beforeFind)
  * [event: "afterFind"](#Model.event_afterFind)
  * [event: "beforeFindAllOptions"](#Model.event_beforeFindAllOptions)
  * [event: "beforeFindAll"](#Model.event_beforeFindAll)
  * [event: "afterFindAll"](#Model.event_afterFindAll)
  * [event: "beforeUpdate"](#Model.event_beforeUpdate)
  * [event: "afterUpdate"](#Model.event_afterUpdate)
  * [event: "beforeDestroy"](#Model.event_beforeDestroy)
  * [event: "afterDestroy"](#Model.event_afterDestroy)
  * [event: "beforeSave"](#Model#event_beforeSave)
  * [event: "afterSave"](#Model#event_afterSave)
  * [event: "beforeDestroy"](#Model#event_beforeDestroy)
  * [event: "afterDestroy"](#Model#event_afterDestroy)

<a name="new_Model"></a>
##new Model(entity)
**Params**

- entity `Object` | `Entity` - Either an object containing data for this model, or a native sequelize or mongoose entity  

**Extends**: `Class`  
**Example**  
var model = new Model({
  firstName: 'Richard'
});
// or
var model = Model.create(sequelizeInstance);

<a name="Model.defaults"></a>
##Model.defaults
Default Options, defined as properties of the Classes default options Object Literal.

**Properties**

- type=ORM `String` - the default model type, either 'ORM' or 'ODM'  
- dbName=false `String` - the name of the database table  
- engine=false `String` - the database engine to use for this model (ORM ONLY)  
- charset=false `String` - the database charset to use for this model (ORM ONLY)  
- comment=false `String` - the database comment to use for this model (ORM ONLY)  
- collate=false `String` - the database collate to use for this model (ORM ONLY)  
- indexes=false `Object` - custom definition of indexes for this model  
- createdAt=createdAt `String` - for use with the timeStampable behaviour  
- updatedAt=updatedAt `String` - for use with the timeStampable behaviour  
- deletedAt=deletedAt `String` - for use with the softDeleteable behaviour  
- underscored=false `Boolean` - the database underscored to use for this model  
- versionable=false `Boolean` - the versionable behaviour  
- freezeDbName=false `Boolean` - if set to true your models tableName(dbName) won't be plural or camelized  
- timeStampable=true `Boolean` - the timeStampable behaviour  
- softDeleteable=true `Boolean` - the softDeleteable behaviour  

<a name="Model.Types"></a>
##Model.Types
Field Types you can use when Native JavaScript Types simply don't cut it...

**Properties**

- ENUM `ENUM` - custom type  
- TINYINT `TINYINT` - custom type  
- BIGINT `BIGINT` - custom type  
- FLOAT `FLOAT` - custom type  
- DECIMAL `DECIMAL` - custom type  
- TEXT `TEXT` - custom type  

<a name="Model.validator"></a>
##Model.validator
The Validator Class, used to validate Instance Fields.

<a name="Model.eventNames"></a>
##Model.eventNames
Life Cycle Event Types, An Array listing of all available Events.

<a name="Model.hasOne"></a>
##Model.hasOne(targetModel, options)
Helper function to setup an association where SourceModel.hasOne(TargetModel), with optional options for the association.

**Params**

- targetModel <code>[Model](#Model)</code> - the TargetModel that this SourceModel belongsTo.  
- options `Array` - the optional options for this association  

**Returns**: `Object` - the association object  
<a name="Model.hasMany"></a>
##Model.hasMany(targetModel, options)
Helper function to setup an association where SourceModel.hasMany(TargetModel), with optional options for the association.

**Params**

- targetModel <code>[Model](#Model)</code> - the TargetModel that this SourceModel belongsTo.  
- options `Array` - the optional options for this association  

**Returns**: `Object` - the association object  
<a name="Model.belongsTo"></a>
##Model.belongsTo(targetModel, options)
Helper function to setup an association where SourceModel.belongsTo(TargetModel), with optional options for the association.

**Params**

- targetModel <code>[Model](#Model)</code> - the TargetModel that this SourceModel belongsTo.  
- options `Array` - the optional options for this association  

**Returns**: `Object` - the association object  
<a name="Model.extend"></a>
##Model.extend(tableName, Static={}, Proto)
Creates a new Model that extends from this one

**Params**

- tableName `String` - optionally define the name of the table/collection  
- Static={} `Object` - Class Static  
- Proto `Object` - Class Prototype  

**Returns**: [Model](#Model)  
<a name="Model.create"></a>
##Model.create(values, queryOptions={})
Create a new model using the values provided and persist/save it to the database.

**Params**

- values `Object` - The values that will be used to create a model instance  
- queryOptions={} `Object`  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model.find"></a>
##Model.find(findOptions={}, queryOptions={})
Find and return the first model that matches the provided findOptions.

**Params**

- findOptions={} `Object`  
  - where `Object` - Criteria for the query  
  - limit `Number` - Result Limiting (Paging)  
  - offset `Number` - Result Offset (Paging)  
  - include `Array` - Lazy/Eager Loading including Nested  
- queryOptions={} `Object`  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model.findAll"></a>
##Model.findAll(findOptions={}, queryOptions={})
Find and return all models that match the provided findOptions.

**Params**

- findOptions={} `Object`  
  - where `Object` - Criteria for the query  
  - limit `Number` - Result Limiting (Paging)  
  - offset `Number` - Result Offset (Paging)  
  - include `Array` - Lazy/Eager Loading including Nested  
- queryOptions={} `Object`  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model.update"></a>
##Model.update(values, queryOptions={})
Update a model using the provided values, and with where criteria supplied in queryOptions.

**Params**

- values `Object` - The values that will be used to create a model instance  
- queryOptions={} `Object`  
  - where `Object` - Criteria to use for the UPDATE statement  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model.destroy"></a>
##Model.destroy(queryOptions={})
Destroy a model using the provided queryOptions's where criteria.

**Params**

- queryOptions={} `Object`  
  - where `Object` - Criteria to use for the UPDATE statement  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model#save"></a>
##model.save(queryOptions={})
Update the current model using the provided values (optional, defaults to this.changed())

**Params**

  - changed() `Object` - The values that will be used to create a model instance  
- queryOptions={} `Object`  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model#destroy"></a>
##model.destroy(queryOptions={})
Destroy the current instance

**Params**

- queryOptions={} `Object`  
  - transaction `Transaction` - The transaction (if any) to use in the query  

**Returns**: `Promise`  
<a name="Model#toJSON"></a>
##model.toJSON()
Convert the model into a JSON ready format (Object literal)

**Returns**: `Object`  
<a name="Model#inspect"></a>
##model.inspect()
Special handler for util.inspect to use Model#toJSON

**Returns**: `Object`  
<a name="Model.event_beforeCreate"></a>
##event: "beforeCreate"
beforeCreate event.

**Type**: `Object`  
<a name="Model.event_afterCreate"></a>
##event: "afterCreate"
afterCreate event.

**Type**: `Object`  
<a name="Model.event_beforeAllFindersOptions"></a>
##event: "beforeAllFindersOptions"
beforeAllFindersOptions event.

**Type**: `Object`  
<a name="Model.event_beforeFindOptions"></a>
##event: "beforeFindOptions"
beforeFindOptions event.

**Type**: `Object`  
<a name="Model.event_beforeFind"></a>
##event: "beforeFind"
afterFind event.

**Type**: `Object`  
<a name="Model.event_afterFind"></a>
##event: "afterFind"
afterFind event.

**Type**: `Object`  
<a name="Model.event_beforeFindAllOptions"></a>
##event: "beforeFindAllOptions"
beforeFindAllOptions event.

**Type**: `Object`  
<a name="Model.event_beforeFindAll"></a>
##event: "beforeFindAll"
beforeFindAll event.

**Type**: `Object`  
<a name="Model.event_afterFindAll"></a>
##event: "afterFindAll"
afterFindAll event.

**Type**: `Object`  
<a name="Model.event_beforeUpdate"></a>
##event: "beforeUpdate"
beforeUpdate event.

**Type**: `Object`  
<a name="Model.event_afterUpdate"></a>
##event: "afterUpdate"
afterUpdate event.

**Type**: `Object`  
<a name="Model.event_beforeDestroy"></a>
##event: "beforeDestroy"
beforeDestroy event.

**Type**: `Object`  
<a name="Model.event_afterDestroy"></a>
##event: "afterDestroy"
afterDestroy event.

**Type**: `Object`  
<a name="Model#event_beforeSave"></a>
##event: "beforeSave"
beforeSave event.

**Type**: `Object`  
<a name="Model#event_afterSave"></a>
##event: "afterSave"
afterSave event.

**Type**: `Object`  
<a name="Model#event_beforeDestroy"></a>
##event: "beforeDestroy"
beforeDestroy event.

**Type**: `Object`  
<a name="Model#event_afterDestroy"></a>
##event: "afterDestroy"
afterDestroy event.

**Type**: `Object`  
