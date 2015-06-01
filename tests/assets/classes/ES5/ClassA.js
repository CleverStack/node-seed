function ClassA(instanceString) {
  ClassA.super_.call(this, instanceString);
}
ClassA.prototype.memberA = 1;
ClassA.prototype.method = function() {
  this.memberA =- this.memberA;
  ES5Class.prototype.method.call(this, false);
};
ClassA.prototype.ownMethod = inlinePreventedFunction;
util.inherits(ClassA, ES5Class);
module.exports.ClassA = ClassA;