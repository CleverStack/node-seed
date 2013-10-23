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
    this.fingerprint = this_new(fingerprint); //clients fingerprint
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


//-------- PRIVATE -------------------------------------------------------

/**
 * New session using fingerprint (public)
 */
DigitalFingerprint.prototype._new = function(fingerprint) {

    return this._encrypt(fingerprint);

};

/**
 * Encrypt a digital fingerprint (private)
 */
DigitalFingerprint.prototype._encrypt = function(fingerprint) {

    //todo: encrypt using methods/aggression based on security setting
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
