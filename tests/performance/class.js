require('babel/register')({
  // loose: ['es6.classes'],
  stage: 0,
  extensions: ['.es6']
});

var Benchmark = require('benchmark')
  , ES5Native = require('./class/ES5Native')
  , ES6Native = require('./class/ES6Native.es6')
  , UberClass = require('./class/UberClass')
  , UberProto = require('./class/UberProto');

new Benchmark
.Suite()
.add('ES5Native', function() {
  for (var i = 0; i < 20000; i++) {
    new ES5Native.ClassA('a');
    new ES5Native.ClassB('b');
  }
})
.add('ES6Native', function() {
  for (var i = 0; i < 20000; i++) {
    new ES6Native.ClassA('a');
    new ES6Native.ClassB('b');
  }
})
.add('UberClass', function() {
  for (var i = 0; i < 20000; i++) {
    UberClass.ClassA.newInstance('a');
    UberClass.ClassB.newInstance('b');
  }
})
.add('UberProto', function() {
  for (var i = 0; i < 20000; i++) {
    UberProto.ClassA.create('a')
    UberProto.ClassB.create('b')
  }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest for construction (polymorphic) is  >>  ' + this.filter('fastest').pluck('name'));

  modelInstances = [
    // ES5Native: 
    [
      new ES5Native.ClassA('a1'),
      new ES5Native.ClassB('b1'),
      new ES5Native.ClassA('a2'),
      new ES5Native.ClassB('b2'),
      new ES5Native.ClassA('a3'),
      new ES5Native.ClassB('b3'),
      new ES5Native.ClassA('a4'),
      new ES5Native.ClassB('b4'),
      new ES5Native.ClassA('a5'),
      new ES5Native.ClassB('b5')
    ],
    // ES6Native: 
    [
      new ES6Native.ClassA('a1'),
      new ES6Native.ClassB('b1'),
      new ES6Native.ClassA('a2'),
      new ES6Native.ClassB('b2'),
      new ES6Native.ClassA('a3'),
      new ES6Native.ClassB('b3'),
      new ES6Native.ClassA('a4'),
      new ES6Native.ClassB('b4'),
      new ES6Native.ClassA('a5'),
      new ES6Native.ClassB('b5')
    ],
    // UberClass:
    [
      UberClass.ClassA.newInstance('a1'),
      UberClass.ClassB.newInstance('b1'),
      UberClass.ClassA.newInstance('a2'),
      UberClass.ClassB.newInstance('b2'),
      UberClass.ClassA.newInstance('a3'),
      UberClass.ClassB.newInstance('b3'),
      UberClass.ClassA.newInstance('a4'),
      UberClass.ClassB.newInstance('b4'),
      UberClass.ClassA.newInstance('a5'),
      UberClass.ClassB.newInstance('b5')
    ],
    // UberProto:
    [
      UberProto.ClassA.create('a1'),
      UberProto.ClassB.create('b1'),
      UberProto.ClassA.create('a2'),
      UberProto.ClassB.create('b2'),
      UberProto.ClassA.create('a3'),
      UberProto.ClassB.create('b3'),
      UberProto.ClassA.create('a4'),
      UberProto.ClassB.create('b4'),
      UberProto.ClassA.create('a5'),
      UberProto.ClassB.create('b5')
    ]
  ];

  // warm-up loop
  for (var dummy = 0; dummy < 4; dummy++) {
    for (var c = 0; c < 10; c++) {
      modelInstances[dummy][c].method();
      if (modelInstances[dummy][c].method.ownMethod) {
        modelInstances[dummy][c].method.ownMethod();
      }
      if (modelInstances[dummy][c].method.parentMethod) {
        modelInstances[dummy][c].method.parentMethod();
      }
    }
  }
  new Benchmark
    .Suite()
    .add('ES5Native#method', function() {
      var instances = modelInstances[0];
      for (var i = 0; i < 50000; i++) {
        for (var c = 0; c < 10; c++) {
          instances[c].method();
        }
      }
    })
    .add('ES6Native#method', function() {
      var instances = modelInstances[1];
      for (var i = 0; i < 50000; i++) {
        for (var c = 0; c < 10; c++) {
          instances[c].method();
        }
      }
    })
    .add('UberClass#method', function() {
      var instances = modelInstances[2];
      for (var i = 0; i < 50000; i++) {
        for (var c = 0; c < 10; c++) {
          instances[c].method();
        }
      }
    })
    .add('UberProto#method', function() {
      var instances = modelInstances[3];
      for (var i = 0; i < 50000; i++) {
        for (var c = 0; c < 10; c++) {
          instances[c].method();
        }
      }
    })
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest method call is ' + this.filter('fastest').pluck('name'));

      new Benchmark
        .Suite()
        .add('ES5Native#parentMethod', function() {
          var instances = modelInstances[0];
          for (var i = 0; i < 50000; i++) {
            for (var c = 0; c < 10; c++) {
              instances[c].parentMethod();
            }
          }
        })
        .add('ES6Native#parentMethod', function() {
          var instances = modelInstances[1];
          for (var i = 0; i < 50000; i++) {
            for (var c = 0; c < 10; c++) {
              instances[c].parentMethod();
            }
          }
        })
        .add('UberClass#parentMethod', function() {
          var instances = modelInstances[2];
          for (var i = 0; i < 50000; i++) {
            for (var c = 0; c < 10; c++) {
              instances[c].parentMethod();
            }
          }
        })
        .add('UberProto#parentMethod', function() {
          var instances = modelInstances[3];
          for (var i = 0; i < 50000; i++) {
            for (var c = 0; c < 10; c++) {
              instances[c].parentMethod();
            }
          }
        })
        .on('cycle', function(event) {
          console.log(String(event.target));
        })
        .on('complete', function() {
          console.log('Fastest parentMethod call is ' + this.filter('fastest').pluck('name'));


          new Benchmark
            .Suite()
            .add('ES5Native#ownMethod', function() {
              var instances = modelInstances[0];
              for (var i = 0; i < 50000; i++) {
                for (var c = 0; c < 10; c++) {
                  instances[c].ownMethod();
                }
              }
            })
            .add('ES6Native#ownMethod', function() {
              var instances = modelInstances[1];
              for (var i = 0; i < 50000; i++) {
                for (var c = 0; c < 10; c++) {
                  instances[c].ownMethod();
                }
              }
            })
            .add('UberClass#ownMethod', function() {
              var instances = modelInstances[2];
              for (var i = 0; i < 50000; i++) {
                for (var c = 0; c < 10; c++) {
                  instances[c].ownMethod();
                }
              }
            })
            .add('UberProto#ownMethod', function() {
              var instances = modelInstances[3];
              for (var i = 0; i < 50000; i++) {
                for (var c = 0; c < 10; c++) {
                  instances[c].ownMethod();
                }
              }
            })
            .on('cycle', function(event) {
              console.log(String(event.target));
            })
            .on('complete', function() {
              console.log('Fastest ownMethod call is ' + this.filter('fastest').pluck('name'));
            })
            .run({
              name  : 'Method Call',
              async : false
            });


        })
        .run({
          name  : 'Parent Method Call',
          async : false
        });

    })
    .run({
      name  : 'Overloaded Method Call',
      async : false
    });

})
.run({
  name  : 'Instantiation',
  async : false
});
