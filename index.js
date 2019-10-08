
const converter = require('./src/converter')

var convertToSQL = (input, removeUnderscoreBeforeID = false) => {
  if (typeof input !== 'string') {
    throw new Error('Input must be type string')
  }
  return converter.produceSQL(input, removeUnderscoreBeforeID)
}

module.exports = {
  convertToSQL
}
