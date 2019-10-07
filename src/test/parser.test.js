/* global describe, it, expect */

const mongoQueries = {
  proper: [
    {
      input: "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 'ALGOL', 'Lisp' ]}},{name: 1, _id: 1});",
      output: "SELECT name, _id FROM user WHERE age >= 21 AND name = 'julio' AND contribs IN ('ALGOL', 'Lisp');"
    },
    {
      input: "db.user.find({name: 'julio'});",
      output: "SELECT * FROM user WHERE name = 'julio';"
    },
    {
      input: 'db.user.find({_id: 23113},{name: 1, age: 1});',
      output: 'SELECT name, age FROM user WHERE _id = 23113;'
    },
    {
      input: 'db.user.find({age: {$gte: 21}},{name: 1, _id: 1});',
      output: 'SELECT name, _id FROM user WHERE age >= 21;'
    },
    {
      input: "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 'ALGOL', 'Lisp' ]}},{name: 1, _id: 1});",
      output: "SELECT name, _id FROM user WHERE age >= 21 AND name = 'julio' AND contribs IN ('ALGOL', 'Lisp');"
    },
    {
      input: "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 33, 2 ]}},{name: 1, _id: 1});",
      output: "SELECT name, _id FROM user WHERE age >= 21 AND name = 'julio' AND contribs IN (33, 2);"
    },
    {
      input: 'db.user.find({ $or: [ { quantity: { $lt: 20 } }, { price: 10 } ]})',
      output: 'SELECT * FROM user WHERE (quantity < 20 OR price = 10);'
    }
  ],
  insert: "db.user.insert({age: {$gte: 21}, name: 'julio'});",
  wrong: 'user.find({age: {$gte: 21}},{name: 1, _id: 1});',
  empty: ''
}

const parser = require('../../index')

describe('General functionality', () => {
  it('should translate MongoDB queries into SQL-leke queries', () => {
    mongoQueries.proper.map(mockedQuery => {
      let outputString
      try {
        outputString = parser.produceSQL(mockedQuery.input)
      } catch (error) {
        throw new Error(error)
      }
      expect(outputString).toEqual(mockedQuery.output)
    })
  })
})

describe('Parser functionality (initial structure)', () => {
  it('should parse the initial query and check for errors in structure', () => {
    const properParsedStructure = {
      fromClausePrepared: 'user',
      queryStatements: "({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 'ALGOL', 'Lisp' ]}},{name: 1, _id: 1})"
    }
    let outputObj
    try {
      outputObj = parser.parseStructure(mongoQueries.proper[0].input)
    } catch (error) {
      throw new Error(error)
    }

    expect(outputObj).toEqual(properParsedStructure)
  })

  it('should support only find functionality and throw error otherwise', () => {
    expect(() => { parser.parseStructure(mongoQueries.insert) })
      .toThrowError(/Wrong or not supported MongoDB method \(insert\)/)
  })

  it('should throw error on wrong query format', () => {
    expect(() => { parser.parseStructure(mongoQueries.wrong) })
      .toThrowError(/Wrong format/)
  })

  it('should throw error on empty string', () => {
    expect(() => { parser.parseStructure(mongoQueries.empty) })
      .toThrowError(/Empty query/)
  })
})
