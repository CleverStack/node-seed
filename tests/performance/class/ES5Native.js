var util = require('util')
  , inlinePreventedFunction = require('./util/inlinePreventedFunction');

function ES5Class(instanceString) {
  this.counter = 0;
  this.instanceArray = [];
  this.instanceString = instanceString;
}
// ES5Class.prototype.counter = 0;
// ES5Class.prototype.instanceArray = [];
// ES5Class.prototype.instanceString = '';
ES5Class.prototype.method = inlinePreventedFunction;
ES5Class.prototype.parentMethod = inlinePreventedFunction;


function ClassA(instanceString) {
  ClassA.super_.call(this, instanceString);
  this.memberA = 1;
}
// ClassA.prototype.memberA = 1;
ClassA.prototype.method = function() {
  this.memberA =- this.memberA;
  ES5Class.prototype.method.call(this, false);
};
ClassA.prototype.ownMethod = inlinePreventedFunction;
util.inherits(ClassA, ES5Class);
module.exports.ClassA = ClassA;



function ClassB(instanceString) {
  ClassB.super_.call(this, instanceString);
  this.memberB = 1;
}
// ClassB.prototype.memberB = 1;
ClassB.prototype.method = function() {
  this.memberB =- this.memberB;
  ES5Class.prototype.method.call(this, false);
};
ClassB.prototype.ownMethod = inlinePreventedFunction;
util.inherits(ClassB, ES5Class);
module.exports.ClassB = ClassB;
