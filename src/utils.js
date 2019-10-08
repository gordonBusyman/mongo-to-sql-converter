const JSON5 = require('json5')

const { MONGO_QUERY_OPERATOR } = require('./constants')

// map mongoDB -> SQL operators
const operatorsMap = {
  $or: 'OR',
  $and: 'AND',
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $ne: '!=',
  $in: 'IN',
  $eq: '='
}

/**
 *
 * @param {*} string
 *
 * convert given string to JS object using JSON5 library, as the string syntax is exactly JSON5 syntax
 */
const parseObjFromString = (string) => {
  const obj = JSON5.parse(string)

  return obj
}

/**
 *
 * @param {*} operand
 * @param {*} operator
 * @param {*} field
 * @param {*} removeUnderscoreBeforeID
 *
 * Return the operand in right format
 */
const getTyppedOperand = (operand, operator, field, removeUnderscoreBeforeID) => {
  if (typeof operand === 'string') { // wrap strings in double quots
    return "'" + operand + "'"
  } else if (operator === 'IN') { // wrap IN arguments in brackers
    operand = operand
      .map(op => getTyppedOperand(op, null, null, removeUnderscoreBeforeID))
      .join(', ')
    return '(' + operand + ')'
  } else if (field === MONGO_QUERY_OPERATOR) { // AND or OR elements
    // recursively call 'buildWhereElement' for nested elements
    // join each element with operator AND or OR
    return operand.reduce((prev, curr) => {
      return [...prev, buildWhereElement(curr, removeUnderscoreBeforeID)]
    }, []).join(' ' + operator + ' ')
  } else {
    return operand
  }
}

/**
 *
 * @param {*} elem
 * @param {*} removeUnderscoreBeforeID
 *
 * Return element of WHERE clause
 */
const buildWhereElement = (elem, removeUnderscoreBeforeID) => {
  if (removeUnderscoreBeforeID && elem.field === '_id') {
    elem.field = 'id'
  }
  const { field, operator, operand } = elem

  if (field === MONGO_QUERY_OPERATOR) { // nested WHERE element
    return '(' + getTyppedOperand(operand, operator, field) + ')'
  } else { // simple WHERE element
    return field + ' ' + operator + ' ' + getTyppedOperand(operand, operator, field, removeUnderscoreBeforeID)
  }
}

module.exports = {
  operatorsMap,
  parseObjFromString,
  buildWhereElement
}
