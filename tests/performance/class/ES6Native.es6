var inlinePreventedFunction = require('./util/inlinePreventedFunction');

class ES6Class {
  counter        = 0;
  instanceArray  = [];
  instanceString = '';
  
  constructor(instanceString) {
    this.instanceString = instanceString;
  }

  method() {
    return inlinePreventedFunction.apply(this, Array.prototype.slice.call(arguments));
  }
  parentMethod() {
    return inlinePreventedFunction.apply(this, Array.prototype.slice.call(arguments));
  }
}

// ES6Class.prototype.counter        = 0;
// ES6Class.prototype.instanceArray  = [];
// ES6Class.prototype.instanceString = '';
// ES6Class.prototype.method         = inlinePreventedFunction
// ES6Class.prototype.parentMethod   = inlinePreventedFunction


class ClassA extends ES6Class {
  memberA = 1;

  method() {
    this.memberA =- this.memberA;
    super.method(false);
  }

  ownMethod() {
    return inlinePreventedFunction.apply(this, Array.prototype.slice.call(arguments));
  }
}
// ClassA.prototype.ownMethod = inlinePreventedFunction;
// ClassA.prototype.memberA   = 1;

module.exports.ClassA      = ClassA;




class ClassB extends ES6Class {
  memberB = 1;

  method() {
    this.memberB =- this.memberB;
    super.method(false);
  }

  ownMethod() {
    return inlinePreventedFunction.apply(this, Array.prototype.slice.call(arguments));
  }
}
// ClassB.prototype.ownMethod = inlinePreventedFunction
// ClassB.prototype.memberB   = 1;

module.exports.ClassB      = ClassB;
