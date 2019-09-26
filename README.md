# mongo-db-converter
This is simple tool to convert mongo query to SQL

It takes string as input and gives string as output. It supports only _db.find_ method and throws an exception when another method used.

List of supported operators

* $or
* $and
* $lt
* $lte
* $gt
* $gte
* $ne
* $in


The actual translator is parser.js and function `produceSQL`
