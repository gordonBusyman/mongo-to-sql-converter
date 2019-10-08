
const { produceSQL } = require('../converter')

const mongoQueries = [
  "db.user.find({name: 'julio'});",
  'db.user.find({_id: 23113},{name: 1, age: 1, _id: 1});',
  'db.user.find({age: {$gte: 21}},{name: 1, _id: 1});',
  "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 'ALGOL', 'Lisp' ]}},{name: 1, _id: 1});",
  "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 33, 2 ]}},{name: 1, _id: 1});",
  'db.user.find({ $or: [ { quantity: { $lt: 20 } }, { price: 10 } ]})',
  'db.user.find({$and : [{ $or : [ { price : 0.99 }, { price : 1.99 } ] },{ $or : [ { sale : true }, { qty : { $lt : 20 } } ] }]});',
  '',
  'db.products.insert( { _id: 10, item: "box", qty: 20 } )'
]

const runTest = () => {
  mongoQueries.map(mongoQuery => {
    try {
      const SQLQuery = produceSQL(mongoQuery, true)
      console.log('\x1b[32m', 'Successfully Converted', '\x1b[0m')
      console.log('Converted FROM: ')
      console.log('-- ' + mongoQuery)
      console.log('')
      console.log('TO:')
      console.log('-- ' + SQLQuery)
    } catch (err) {
      console.log()
      console.log('\x1b[31m', 'Unable to convert query', '\x1b[0m')
      console.log(err)
    }
    console.log('______________________________________________________________________________________________')
  })
}

runTest()
