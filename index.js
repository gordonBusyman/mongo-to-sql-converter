
const converter = require('./src/converter')

/**
 *
 * @param {string} input
 * @param {boolean} removeUnderscoreBeforeID
 *
 * @returns {string}
 * @description Convert MongoDB query to SQL query. removeUnderscoreBeforeID flag, if true will convert _id to id, default false
 */
const convertToSQL = (input, removeUnderscoreBeforeID = false) => {
  if (typeof input !== 'string') {
    throw new Error('Input must be type string')
  }
  return converter.produceSQL(input, removeUnderscoreBeforeID)
}

module.exports = {
  convertToSQL
}
