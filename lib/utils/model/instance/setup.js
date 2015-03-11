function setupProperty(propName) {
  Object.defineProperty(this, propName, {
    get          : this.proxy(this.Class.getters[propName]),
    set          : this.proxy(this.Class.setters[propName]),
    enumerable   : true,
    configurable : false
  });
}

function setupModelInstance() {
  Object.keys(this.Class.getters).forEach(this.proxy(setupProperty));

  if (this.Class.timeStampable) {
    setupProperty.apply(this, [this.Class.createdAt]);
    setupProperty.apply(this, [this.Class.updatedAt]);
  }

  if (this.Class.softDeleteable) {
    setupProperty.apply(this, [this.Class.deletedAt]);
  }
}

module.exports = setupModelInstance;