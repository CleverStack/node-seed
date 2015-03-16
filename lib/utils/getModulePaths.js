var fs          = require('fs')
  , path        = require('path')
  , appRoot     = path.resolve(path.join(__dirname, '..', '..'))
  , modulesRoot = path.join(appRoot, 'modules');

module.exports  = function getModulePaths() {
  var paths     = []
    , args      = [].slice.call(arguments);

  fs.readdirSync(modulesRoot).forEach(function(name) {
    if (fs.statSync(path.join(modulesRoot, name)).isDirectory()) {
      var modulePath = ['modules', name].concat(args).join(path.sep);
      if (!args.length || (modulePath.indexOf('*') !== -1 && /^([^\*]+)(.*)/.test(modulePath) && fs.existsSync(RegExp.$1)) || fs.existsSync(modulePath)) {
        paths.push(modulePath);
      }
    }
  });

  return paths;
};
