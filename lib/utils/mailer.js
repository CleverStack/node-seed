var Promise     = require('bluebird')
  , config      = require('config')
  , sendgrid;

module.exports  = {
  send: function(payload) {
    
    return new Promise(function(resolve, reject) {
      try {
        if (!sendgrid) {
          sendgrid = require('sendgrid')(config.sendgrid.apiUser, config.sendgrid.apiKey);
        }
      } catch(e) {
        return reject(e);
      }

      sendgrid.send(payload, function(err, res) {
        if (!err) {
          resolve(res);
        } else {
          reject(new Error(err));
        }
      });
    });
  }
};
