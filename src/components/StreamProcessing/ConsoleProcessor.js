var Processor = require('./ProcessorStream');

// Debugger Processor, just outputs data
// to the console as it passes through the stream

module.exports = function(prefix) {

	return new Processor(

		function(data) {
			console.log(prefix, data);
			return data;
		}
		
	);

};

