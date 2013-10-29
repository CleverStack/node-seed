/*

npm-digital-fingerprints
Digital Fingerprints Security for Cleverstack.io
Author: Clevertech.biz

*/

/**
 * Module dependencies.
 */
var cryptojs = require('crypto')
    , S = require('string');


//-------- CONSTRUCTOR -------------------------------------------------------

function DigitalFingerprint() {

    this.key = "digital-fingerprint";
    this.salt = ""; //private salt (must be unique for every app, set in security config)
    this.grade = ""; //security grade (aggression level, set in security config)
    this.random = Math.random(); //random number
    this._clear(); //reset variable params

};

/**
 * Check token is valid
 */
DigitalFingerprint.prototype.check = function(token, fingerprint) {

    var tokenCheck = this._encrypt(fingerprint); //encrypt the fingerprint for checks
    return ( (this.token == token) && (this.fingerprint == fingerprint) && (this.token == tokenCheck) ); //check they all match

}

/**
 * New session using fingerprint
 */
DigitalFingerprint.prototype.new = function(fingerprint, salt, grade) {

    this._clear(); //reset
    this.fingerprint = fingerprint;
    this.salt = salt;
    this.grade = grade;
    this.token = this._encrypt(fingerprint);

    return this.token;

};

/**
 * Clear current fingerprint params
 */
DigitalFingerprint.prototype._clear = function() {

    this.token = null; //encrypted session token
    this.password = null; //secret strong password
    this.key = null; //random key generated for each token
    this.fingerprint = null; //random key generated for each token

};

/**
 * Encrypt a digital fingerprint using aggression based on security grade setting
 */
DigitalFingerprint.prototype._encrypt = function(fingerprint) {

    var key, hash, cipher, token;

    switch(this.grade) {

        case "low": {

            //generate key
            key = this._generateKey(128, 1000);

            //generate hashed fingerprint
            token = this._generateHash(fingerprint, key, "sha256"); //SHA2 32-bit (outputs 128 hash)

            break;
        }

        case "low-med": {

            //generate key
            key = this._generateKey(128, 1000);

            //generate hashed fingerprint
            token = this._generateHash(fingerprint, key, "sha512"); //SHA2 64-bit (outputs 256 hash)

            break;
        }

        case "med": {

            //generate key
            key = this._generateKey(256, 1000);

            //return ciphered
            cipher = cryptojs.createCipher('aes128', key) //AES The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS).
            cipher.update(fingerprint, 'utf8', 'base64');
            token = cipher.final('base64');

            break;
        }

        case "med-high": {

            //generate key
            key = this._generateKey(256, 10000);

            //return ciphered (after hashed)
            cipher = cryptojs.createCipher('aes256', key) //AES The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS).
            cipher.update(fingerprint, 'utf8', 'base64');
            token = cipher.final('base64');

            break;
        }

        case "high": {

            //generate key
            key = this._generateKey(512, 100000);

            //return ciphered
            cipher = cryptojs.createCipher('aes256', key) //AES The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS).
            cipher.update(fingerprint, 'utf8', 'base64');
            token = cipher.final('base64');

            break;
        }

        default: {

            console.log("Please choose a valid security setting for your digital fingerprint: low, low-med, med, med-high, high.");
            break;
        }

    }

    return S(encodeURIComponent(token)).s;

};

/**
 * Generate a new key based on security setting
 */
DigitalFingerprint.prototype._generateKey = function(length, iterations) {

    if (this.key !== null) {
        return this.key;
    }

    var salt, key, password, length, iterations;

    //add random number to key prevent rainbow tables
    salt = this.salt + this.random;

    //generate secure password (more random goodness!)
    try {
        password = this.password = cryptojs.randomBytes(256);
    } catch (ex) {}
    console.log('random key password === '+password);

    //generate secure key
    key = this.key = cryptojs.pbkdf2Sync(password, salt, iterations, length);
    console.log('secure key === '+key);

    return key;

};

/**
 * Generate a new hash based on algorithm and key
 */
DigitalFingerprint.prototype._generateHash = function(fingerprint, key, algorithm) {

    /*
        "sha256",   //SHA2 32-bit (outputs 128 hash)
        "sha512",   //SHA2 64-bit (outputs 256 hash)
    */

    // generate a hash from fingerprint
    return cryptojs
            .createHash(algorithm, key)
            .update(new Buffer(fingerprint, 'utf-8'))
            .digest('hex');

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
