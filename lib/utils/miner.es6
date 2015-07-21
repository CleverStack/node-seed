var path     = require('path')
  , injector = require('injector')
  , debug    = require('debug')('cleverstack:utils:miner')
  , miner    = require('miner')
  , env;

export default function() {
  env = injector.getInstance('env');
  env.moduleLoader.on('routesInitialized', () => {
    let internalTunnel;

    if (['LOCAL', 'DEV'].indexOf(env.config.environmentName) !== -1 && env.config.miner.enabled === true) {
      miner.localtunnel({port : env.webPort}, (error, url, tunnel) => {
        env.config.publicUrl = url;

        internalTunnel = tunnel;
        console.log('Tunnel open on: ' + url);
      });
    }

    env.app.on('close', () => {
      if (internalTunnel) {
        internalTunnel.close();
      }
    });
  });
}
