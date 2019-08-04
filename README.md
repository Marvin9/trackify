# trackify
npm package to track activities of request, database, error or custom. Log all in txt file with timestamp.

![npm](https://img.shields.io/npm/v/trackify)
![GitHub repo size](https://img.shields.io/github/repo-size/Marvin9/trackify?color=green)

## [See demo of logs.txt file](https://github.com/Marvin9/trackify/tree/master/test)

## Installation
```
npm install trackify
```

## Update 

* Version 1.1.0
  * Change in naming convention.
    * `tracker.db_connection() -> tracker.db()`
    * `tracker.nosqldb_query() -> tracker.nosql_query()`
    * `tracker.relational_db_query() -> tracker.relational_query()`
  * Change in argument passing in Init.
    * `new trackify({infinity_ : true}) -> new trackify({app_name : "Your app name", infinity_ : true})`

## Initialization
```javascript
const trackify = require('trackify');
```

## API

### Init
```javascript
const tracker = new trackify({app_name : "Your app name",infinity_ : true});
```
* It creates `logs.txt` in root folder.
* `{app_name : string}` (default "App")
* `{infinity_ : boolean}`(default false)
  * `false` : Clear previous records of file and write new records.
  * `true` : Don't clear previous records of file.

### tracker.start() (Optional but recommended)
```javascript
tracker.start();
```
* Add to `logs.txt` that app started with `timestamp`

### tracker.request(method:string, route:string)
```javascript
tracker.request("get", "/api/json");
```
* It logs method and route in `logs.txt`
  * `method` : `get`| `post` | `put` | `delete`. capital input also works.
  * `route` : `/anything`
  
#### good use
```javascript
router.all('*', (request, response, next) => {
  tracker.request(request.method, request.url);
  next();
});
```

### tracker.error(new Error(error:object))
```javascript
fs.readFile('noexist.txt', (err) => {
  if(err) tracker.error(new Error(err));
});
```

* It logs error and exit app.
* Whenever you need to use `throw new Error(err)`, use this function.

### tracker.db(dbname:string)
```javascript
MongoClient.connect(url, (err, db) => {
  if(err) tracker.error(new Error(err));
  tracker.db("MongoDB");
  
  // your code
  
});
```
### tracker.nosql_query(table_name:string, operation:string, value:object, value_updated:object)
```javascript
//select
let unique_key = {_id : "unique"};
db.find(unique_key, (err, doc) => {
  if(err) tracker.error(new Error(err));
  
  tracker.nosql_query("tablename", "select", unique_key); //two arguments
  
});

//update
let from = {_id : "unique"};
let to = {val : "updated value"};
db.update(from, to, (err, doc) => {
  if(err) tracker.error(new Error(err));
  
  tracker.nosql_query("tablename", "update", from, to); // three arguments
  
});

//insert
let insert_this = {_id : "uniqueid", name : "mayursinh"};
db.insert(insert_this, (err) => {
  if(err) tracker.error(new Error(err));
  
  tracker.nosql_query("tablename", "insert", insert_this);
  
});

//delete
let delete_this = {_id : "uniqueid"};
db.insert(delete_this, (err) => {
  if(err) tracker.error(new Error(err));
  
  tracker.nosql_query("tablename", "delete", delete_this);
  
});
```
* It logs query to file. function for nosql databases like MongoDB
  * `table_name` : table name on which operation is being done.
  * `operation` : `select` | `insert` | `update` | `delete`. capital words also works.
  * `value` : key which is being operated on table.
  * `value_updated` : in case of `update` this argument should be passed.
  
### tracker.relational_query(table_name:string, operation:string, query:string)
```javascript
const sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
con.query(sql, (err, result) => {
  if(err) tracker.error(new Error(err));
  tracker.relational_query("customers", "insert", sql);
});
```
* It logs query to file. function for relational databases like MySQL, PostgreSQL
  * `table_name` and `operation` same as above.
  * `query` : query you passed to db.
  
### tracker.custom(log:string, type:string) 
```javascript
setTimeout(() => {
  tracker.custom("5 second passed.", "Custom time tracking");
}, 5000);
```
* You are free to logs your custom things :)
  * `log` : message you want to log.
  * `type` : *(optional)* default value is null, type of the log. Sometimes there are multiple logs with same types.
  
