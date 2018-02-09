# x-db-oplog-cursor

Create mongo oplog cursors.

## Installation

``` bash
$ npm install x-db-oplog-cursor
```

## Usage

``` javascript
const MongoCursor = require('x-db-oplog-cursor');
const { MongoClient } = require('mongodb');
const { log } = console;

MongoClient.connect((err, db) => {
  const ts = Date.now() / 1000 | 0;
  const ns = 'news';

  // Get cursor
  const mongoCursor = MongoCursor({ ns, db, ts });

  mongoCursor.cursor((err, cursor) => {
    // Get cursor stream
    const stream = cursor.stream();

    stream.on('end', () => log('stream ended'));
    stream.on('data', data => log(data));
    stream.on('error', err => log(err));
  });

  // Or for short cut

  // Get cursor
  const mongoCursor = MongoCursor({ ns, db, ts }, (err, cursor) => {
    // get cursor stream
    const stream = cursor.stream();

    stream.on('end', () => log('stream ended'));
    stream.on('data', data => log(data));
    stream.on('error', err => log(err));
  });
});
```

## API

### MongoCursor(options, [fn])

Set cursor object, if callback is passed then it will create and return an oplog cursor.

Options:

  * `db`: Required valid Mongo Db instance.
  * `ns`: Optional namespace for start tailing on eg.(`test.news`, `*.news`, `test.*`), defaults to `*`.
  * `ts`: Optional UTC timestamp in miliseconds for oplog cursor query.
  * `coll`: Optional oplog collection name, defaults to `oplog.rs`.

### mongoCursor.cursor(fn)

Create oplog cursor.

```javascript
mongoCursor.cursor((err, cursor) => {
   const stream = cursor.stream();
})
```

## Run tests

Configure MongoDB for ac active oplog:

Start MongoDB with:

``` bash
$ mongod --replSet test
```

Start a `mongo` shell and configure mongo as follows:

```bash
> var config = {_id: "test", members: [{_id: 0, host: "127.0.0.1:27017"}]}
> rs.initiate(config)
```

Once configuration is initiated then you can run the test:

``` bash
$ npm install
$ make test
```

