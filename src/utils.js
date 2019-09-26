const acorn = require('acorn')

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
 * Return a JS object parsed from string
 */
const parseObjFromString = (string) => {
  // check for valid JS code usind acorn lib
  try {
    acorn.parse(string)
  } catch (err) {
    throw Error('Non-valid JS object in find arguments: ' + string)
  }
  // extract obj from string
  const obj = new Function('return ' + string)()
  if (typeof obj === 'object') {
    return obj
  } else {
    throw Error('Unable to parse object from find arguments')
  }
}

/**
 *
 * @param {*} operand
 * @param {*} operator
 *
 * Return the operand in right format
 */
const getTyppedOperand = (operand, operator, field) => {
  if (typeof operand === 'string') { // wrap strings in double quots
    return '"' + operand + '"'
  } else if (operator === 'IN') { // wrap IN arguments in brackers
    operand = operand
      .map(op => getTyppedOperand(op, null))
      .join(', ')
    return '(' + operand + ')'
  } else if (field === MONGO_QUERY_OPERATOR) { // AND or OR elements
    // recursively call 'buildWhereElement' for nested elements
    // join each element with operator AND or OR
    return operand.reduce((prev, curr) => {
      return [...prev, buildWhereElement(curr)]
    }, []).join(' ' + operator + ' ')
  } else {
    return operand
  }
}

/**
 *
 * @param {*} elem
 *
 * Return element of WHERE clause
 */
const buildWhereElement = (elem) => {
  const { field, operator, operand } = elem
  if (field === MONGO_QUERY_OPERATOR) { // nested WHERE element
    return '(' + getTyppedOperand(operand, operator, field) + ')'
  } else { // simple WHERE element
    return field + ' ' + operator + ' ' + getTyppedOperand(operand, operator, field)
  }
}

module.exports = {
  operatorsMap,
  parseObjFromString,
  buildWhereElement
}
