var fs          = require('fs')
  , path        = require('path')
  , appRoot     = path.resolve(path.join(__dirname, '..', '..'))
  , packageJson = require(path.join(appRoot, 'package.json'));

module.exports  = function() {
  var paths     = []
    , args      = [].slice.call(arguments);

  packageJson.bundledDependencies.forEach(function(name) {
    var modulePath = [ 'modules', name ].concat(args).join(path.sep);
    if ((modulePath.indexOf('*') !== -1 && /^([^\*]+)(.*)/.test(modulePath) && fs.existsSync(RegExp.$1)) || fs.existsSync(modulePath)) {
      paths.push(modulePath);
    }
  });

  return paths;
}
