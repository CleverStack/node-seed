var inlinePreventedFunction = require('./util/inlinePreventedFunction');

var UberProto = require('uberproto').extend({
  counter        : 0,
  instanceArray  : [],
  instanceString : '',
  init: function(instanceString) {
    this.instanceString = instanceString;
  },
  method: inlinePreventedFunction,
  parentMethod: inlinePreventedFunction
});

var ClassA = UberProto.extend({
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

var ClassB = UberProto.extend({
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
