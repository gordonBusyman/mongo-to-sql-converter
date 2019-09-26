
const { produceSQL } = require('./parser')

const mongoQueries = [
  "db.user.find({name: 'julio'});",
  'db.user.find({_id: 23113},{name: 1, age: 1});',
  'db.user.find({age: {$gte: 21}},{name: 1, _id: 1});',
  "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 'ALGOL', 'Lisp' ]}},{name: 1, _id: 1});",
  "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 33, 2 ]}},{name: 1, _id: 1});",
  'db.user.find({ $or: [ { quantity: { $lt: 20 } }, { price: 10 } ]})',
  'db.user.find({$and : [{ $or : [ { price : 0.99 }, { price : 1.99 } ] },{ $or : [ { sale : true }, { qty : { $lt : 20 } } ] }]});'
]

const runTest = () => {
  mongoQueries.map(mongoQuery => {
    const SQLQuery = produceSQL(mongoQuery)
    console.log('Converted FROM: ')
    console.log('-- ' + mongoQuery)
    console.log('')
    console.log('TO:')
    console.log('-- ' + SQLQuery)
    console.log('______________________________________________________________________________________________')
  })
}

runTest()
