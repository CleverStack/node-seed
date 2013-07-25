/**
 * Microsoft tedious row result processor. Function
 * generates a processor which extracts the requested
 * column names from a remote database call to SQL server
 *
 * @type {Stream}
 */

var Processor = require('./ProcessorStream');

module.exports = function(fields) {
  
  return new Processor(
    
    // stream onWrite. Takes bizarre column format from
    // MSSQL and peels actual values back into a recognizable
    // hash for the next section of the processing

    function(row) {
      var result = {};
      fields.forEach(function(fieldName) {
        result[fieldName] = row[fieldName].value;
      }); 
      return result;
    }

  );

};
