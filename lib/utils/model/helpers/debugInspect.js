var util        = require('util')
  , inspectUtil = util.inspect;

function debugInspect(obj) {
  return inspectUtil(obj, {showHidden: false, colors: true, customInspect: true, depth: 2}).replace(/\n[\ ]+/igm, ' ');
  // return inspectUtil(obj, {showHidden: false, colors: true, customInspect: true, depth: 0}).replace(/(\n[\ ]+|\{\ )/igm, '\n\ \ \ \ ');
}

module.exports = debugInspect;