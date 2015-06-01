module.exports = function(preventInline) {
  if (this.counter > 99) {
    this.counter = this.counter / 2;
  } else {
    this.counter++;
  }

  if (preventInline) {
    var i = 0;
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
    for (i = 0; i < 1; i++) dummy.method();
  }
};
