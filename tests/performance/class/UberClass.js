var inlinePreventedFunction = require('./util/inlinePreventedFunction');

var UberClass = require('uberclass').extend({
  counter        : 0,
  instanceArray  : [],
  instanceString : '',
  init: function(instanceString) {
    this.instanceString = instanceString;
  },
  method: inlinePreventedFunction,
  parentMethod: inlinePreventedFunction
});

var ClassA = UberClass.extend({
  memberA: 1,
  init: function(instanceString) {
    this._super(instanceString);
  },
  method: function() {
    this.memberA =- this.memberA;
    this._super(false);
  },
  ownMethod: inlinePreventedFunction
});
module.exports.ClassA = ClassA;



var ClassB = UberClass.extend({
  memberB: 1,
  init: function(instanceString) {
    this._super(instanceString);
  },
  method: function() {
    this.memberB =- this.memberB;
    this._super(false);
  },
  ownMethod: inlinePreventedFunction
});
module.exports.ClassB = ClassB;
