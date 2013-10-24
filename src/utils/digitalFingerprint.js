/*

npm-digital-fingerprints
Digital Fingerprints Security for Cleverstack.io
Author: Clevertech.biz

*/

/**
 * Module dependencies.
 */
var cryptojs = require('crypto')
  , fs = require('fs');


//-------- CONSTRUCTOR -------------------------------------------------------

function DigitalFingerprint() {
    this.key = "digital-fingerprint";
    this.fingerprint = ""; //clients fingerprint
    this.salt = ""; //private salt key (must be unique for every app)
    this.aggression = ""; //security aggression level
    this.token = ""; //encrypted session token
};

/**
 * Check token is valid
 */
DigitalFingerprint.prototype.check = function(token, fingerprint) {

    var tokenCheck = this_encrypt(fingerprint);
    return (this.token === tokenCheck);

}

/**
 * Clear current fingerprint
 */
DigitalFingerprint.prototype.clear = function() {

    this.token = null;
    return this;

};

/**
 * New session using fingerprint
 */
DigitalFingerprint.prototype.new = function(fingerprint, salt, aggression) {

    this.fingerprint = fingerprint;
    this.salt = salt;
    this.aggression = aggression;
    return this._encrypt();

};

/**
 * Encrypt a digital fingerprint
 */
DigitalFingerprint.prototype._encrypt = function() {

    //encrypt using aggression based on security setting (1-5+)

    //todo: implement stronger algorithms & ciphers (see below)

    var mapping = {
            "1" : "sha256",
            "2" : "sha512"
            //AES The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS).
            //Rabbit is a high-performance stream cipher and a finalist in the eSTREAM Portfolio.
            //MARC4 (Modified Allegedly RC4) is based on RC4, a widely-used stream cipher.
            //PBKDF2 Crypto-JS provided an alternative version that executes asyncronously
            //higher aggression settings here
        }
      , algorithm = (this.aggression) ? mapping[this.aggression] : mapping["1"] //default
      , hash
      , hmac;

      // console.log('aggression level = '+this.aggression);
      // console.log('algorithm = '+algorithm);

      algorithm = 'CRC32';

    hash = cryptojs
            .createHash(algorithm, this.salt)
            .update(new Buffer(this.fingerprint, 'binary'))
            .digest('hex');

    return hash;

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
