var helmet = require('helmet');

module.exports = function( app, config ) {

    // Content Security Policy
    if ( config.security.csp ) {
        app.use(helmet.csp());
        if ( config.security.csp.policy ) {
            helmet.csp.policy(config.security.csp.policy);
        }
    }

    // HTTP Strict Transport Security
    if ( config.security.hsts ) {
        app.use(helmet.hsts(config.security.hsts.maxAge, config.security.hsts.includeSubdomains));
    }

    // X-FRAME-OPTIONS
    if ( config.security.xframe ) {
        app.use(helmet.xframe());
    }

    // X-XSS-PROTECTION for IE8+
    if ( config.security.iexss) {
        app.use(helmet.iexss());
    }

    // X-Content-Type-Options nosniff
    if ( config.security.contentTypeOptions ) {
        app.use(helmet.contentTypeOptions());
    }

    // Cache-Control no-store, no-cache
    if ( config.security.cacheControl ) {
        app.use(helmet.cacheControl());
    }

};
