
const mongoParse = require('mongo-parse')

const {
  operatorsMap,
  parseObjFromString,
  buildWhereElement
} = require('./utils')
const { MONGO_QUERY_OPERATOR } = require('./constants')

var produceSQL = (input, removeUnderscoreBeforeID) => {
  const { fromClausePrepared, queryStatements } = parseStructure(input.trim())
  const { whereClausePrepared, selectClausePrepared } = parseStatements(queryStatements.trim())

  return buildSQL({
    selectClausePrepared,
    fromClausePrepared,
    whereClausePrepared
  }, removeUnderscoreBeforeID)
}

/**
 *
 * @param {*} originalQuery
 *
 * Check if given string is valid mongoDB query
 * Returns the collection(table) name and string with query parameters
 */
const parseStructure = (originalQuery) => {
  /**
   * parsing strategy is to use indexOf(char) and then slice() instead if split(char)
   * the reason: it is possible LIKE statement to contain a dot
   * */
  if (originalQuery.length < 1) {
    throw Error('Empty query')
  }
  // check if query starts with db
  let index = originalQuery.indexOf('.')
  if (index === -1) {
    throw Error('Wrong format')
  }
  const prefix = originalQuery.slice(0, index)
  if (prefix !== 'db') {
    throw Error('Wrong format')
  }

  // parse the collection name
  let rest = originalQuery.slice(index + 1)
  index = rest.indexOf('.')
  if (index === -1) {
    throw Error('Wrong format')
  }
  const fromClausePrepared = rest.slice(0, index)
  if (fromClausePrepared.length < 1) {
    throw Error('Missing collection name')
  }

  // the only supported method is 'find'
  rest = rest.slice(index + 1)
  index = rest.indexOf('(')
  const method = rest.slice(0, index)
  if (method !== 'find') {
    throw Error('Wrong or not supported MongoDB method (' + method + ')')
  }

  // cut the semicolon from the end of query if exists
  let lastChar = rest.length
  if (rest[lastChar - 1] === ';') {
    lastChar -= 1
  }
  const queryStatements = rest.slice(index, lastChar)

  return {
    fromClausePrepared,
    queryStatements
  }
}

/**
 *
 * @param {*} originalStatements
 *
 * Parse SELECT and WHERE clauses to JS-readable format
 */
const parseStatements = (originalStatements) => {
  // check if 'find' followed by parenthized statement
  if (originalStatements[0] !== '(' || originalStatements[originalStatements.length - 1] !== ')') {
    throw Error('Method is not parenthized')
  }

  /**
   * convert the string containing query(cleaned from brackets) to JS object(array)
   * using parseObjFromString function from utils.js
   */
  const preparedForObjectParsing = '[' + originalStatements.slice(1, originalStatements.length - 1) + ']'
  const query = parseObjFromString(preparedForObjectParsing)

  // parse where clause to JS-readable format
  const whereParsed = mongoParse.parse(query[0])
  // parse select clause to JS-readable format
  const selectParsed = mongoParse.parse(query[1])

  // build usable prepared WHERE
  const whereClausePrepared = whereParsed.parts.reduce((prev, curr) => [
    ...prev, prepareWhereClause(curr)
  ], [])

  // build usable prepared SELECT
  const selectClausePrepared = selectParsed.parts.reduce((prev, curr) => {
    if (curr.operand === 1) {
      return [...prev, curr.field]
    }
  }, [])

  return {
    whereClausePrepared,
    selectClausePrepared
  }
}

/**
 *
 * @param {*} currentMongoParserElement
 *
 * Build usable prepared WHERE element taking into account nested elements
 */
const prepareWhereClause = (currentMongoParserElement) => {
  const { field, operator, operand } = currentMongoParserElement

  // AND or OR operators with nested elements
  if (typeof field === 'undefined') {
    // parse nested elements
    const nested = operand.reduce((prev, curr) => {
      const parsed = mongoParse.parse(curr)
      return [...prev, prepareWhereClause(parsed.parts[0])]
    }, [])

    // nested WHERE element
    return {
      field: MONGO_QUERY_OPERATOR,
      operator: operatorsMap[operator],
      operand: nested
    }
  }
  // simple WHERE element
  return {
    field,
    operator: operatorsMap[operator],
    operand
  }
}

/**
 *
 * @param {*} describedQuery
 * @param {*} removeUnderscoreBeforeID
 *
 * Construct final SQL query
 */
const buildSQL = (describedQuery, removeUnderscoreBeforeID) => {
  const { selectClausePrepared, fromClausePrepared, whereClausePrepared } = describedQuery

  if (removeUnderscoreBeforeID) {
    selectClausePrepared.map((field, index) => {
      if (field === '_id') {
        selectClausePrepared[index] = 'id'
      }
    })
  }
  // build WHERE string clause by adding each element of array to it, separated with AND
  const whereClauseSQL = whereClausePrepared.reduce((prev, curr) => [
    ...prev, buildWhereElement(curr, removeUnderscoreBeforeID)
  ], []).join(' AND ')

  const select = 'SELECT ' + (selectClausePrepared.length > 0 ? selectClausePrepared.join(', ') : '*')
  const from = 'FROM ' + fromClausePrepared
  const where = 'WHERE ' + whereClauseSQL

  return select + ' ' + from + ' ' + where + ';'
}

module.exports = {
  produceSQL,
  parseStructure,
  parseStatements,
  buildSQL
}
