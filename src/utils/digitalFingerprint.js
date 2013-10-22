/*

npm-digital-fingerprints
Digital Fingerprints Security for Cleverstack.io
Author: Clevertech.biz

*/

/**
 * Module dependencies.
 */
var crypto = require('crypto')
  , fs = require('fs');


//-------- CONSTRUCTOR -------------------------------------------------------

function DigitalFingerprint(fingerprint, aggression, salt) {
    this.key = "digital-fingerprint";
    this.fingerprint = fingerprint; //clients fingerprint
    this.salt = salt; //private salt key (must be unique for every app)
    this.aggression = aggression; //security aggression level 1,2,3 (higher is more secure)
    this.token = null; //encrypted session token
};


//-------- PUBLIC ------------------------------------------------------------

/**
 * Check token is valid (public)
 */
DigitalFingerprint.prototype.check = function(token, fingerprint) {

    var tokenCheck = this_encrypt(fingerprint);
    return (this.token === tokenCheck);

}

/**
 * Clear current fingerprint (public)
 */
DigitalFingerprint.prototype.clear = function() {

    this.token = null;
    return this;

};

/**
 * New session using fingerprint (public)
 */
DigitalFingerprint.prototype.new = function(fingerprint) {

    //todo: add users ip address and HTTP accept headers to fingerprint

    /*
        request.connection.remoteAddress (remote ip)
        request.headers['X-Forwarded-For'] (if the server is behind a proxy)
    */
    // var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    return this._encrypt(fingerprint);

};


//-------- PRIVATE -------------------------------------------------------

/**
 * Encrypt a digital fingerprint (private)
 */
DigitalFingerprint.prototype._encrypt = function(fingerprint) {

    //todo: encrypt using aggression based on security setting
    //todo: implement more methods of encryption
    //'sha1', 'md5', 'sha256', 'sha512' http://nodejs.org/api/crypto.html
    var shasum = crypto.createHmac("sha256", this.salt);

    shasum
        .update(fingerprint)
        .digest('hex');

    return shasum;

};


//-------- EXPORTS --------------------------------------------------------

/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new DigitalFingerprint();

/**
 * Expose constructors.
 */
exports.digitalFingerprint = DigitalFingerprint;
