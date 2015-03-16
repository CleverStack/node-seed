var utils       = require('utils')
  , env         = utils.bootstrapEnv()
  , expect      = require('chai').expect;

describe('utils.bootstrapEnv', function() {
  it('Should have bootstrapped the environment', function(done) {
    expect(env).to.be.an('object');
    expect(env).to.have.property('config');
    expect(env).to.have.property('express');
    expect(env).to.have.property('app');
    expect(env).to.have.property('moduleLoader');
    expect(env).to.have.property('webPort');
    expect(env).to.have.property('packageJson');
    
    done();
  });
});
