var Promise     = require('bluebird')
  , path        = require('path')
  , ejs         = require('ejs')
  , appRoot     = require('injector').getInstance('appRoot');

module.exports  = function(template, data) {
  return new Promise(function(resolve, reject) {
    ejs.renderFile(appRoot + path.sep + template, data, function(err, html){
      if (err) {
        reject(err);
        return;
      }

      resolve(html);
    });
  });
};