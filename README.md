# mongo-to-sql-converter
This is simple tool to convert MongoDB query (```find()```) to SQL


The package takes string as input and gives string as output. It supports only _db.find_ method and throws an exception when another method used.

## Getting Started

### Installing

```
npm i mongo-to-sql-converter
```

### Usage


```
var mongoToSqlConverter = require("mongo-to-sql-converter")

const MongoDBQuery = "db.user.find({age: {$gte: 21}, name: 'julio', contribs: { $in: [ 'ALGOL', 'Lisp' ]}},{name: 1, _id: 1});"
const SQLQuery = mongoToSqlConverter.convertToSQL(MongoDBQuery, true)

console.log(SQLQuery)
```

```removeUnderscoreBeforeID``` flag, if ```true``` will convert \_id to id, default ```false``` 

List of supported operators in MongoDB query

* $or
* $and
* $lt
* $lte
* $gt
* $gte
* $ne
* $in



## Running the tests

Run demo with predefined parameters
```
npm run demo
```

Run the test
```
npm run test
``` 

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/gordonBusyman/mongo-to-sql-converter/blob/master/LICENSE) file for details
