/**
 * Runs the indicated processing function on streaming data packets
 * @author Mason Houtz
 */

var util = require('util'),
  Stream = require('stream');

function ProcessorStream(onWrite, onEnd) {
  this.readable = true;
  this.writable = true;
  this.onWrite = onWrite || null;
  this.onEnd = onEnd || null;
}

util.inherits(ProcessorStream, Stream);

ProcessorStream.prototype.write = function(data) {
  var processedData = (this.onWrite) ? this.onWrite(data) : data;
  this.emit('data', processedData);
};

ProcessorStream.prototype.end = function() {
  if (this.onEnd)
    this.onEnd.apply(this.onEnd, arguments);
  this.emit('end');
};

module.exports = ProcessorStream;