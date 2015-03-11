module.exports = function setupGettersAndSetters(Klass, Proto) {
  Klass.getters = Proto.getters !== undefined ? Proto.getters : {};
  Klass.setters = Proto.setters !== undefined ? Proto.setters : {};
  
  delete Proto.getters;
  delete Proto.setters;
};