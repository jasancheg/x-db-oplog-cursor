# x-db-oplog-cursor

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> Version: 0.1.0.
>
> Updated: Feb 10, 2018. 4:24 pm UTC-6
>
> Status: completed

Create mongo oplog cursors.

## Features

* The package has a very small footprint and requires just a few dependencies including `mongodb`, `debug` and `eventemitter3`.
* Built on top of the native NodeJS [MongoDB driver](https://github.com/mongodb/node-mongodb-native/).
* Support start and stop tailing the MongoDB `oplog` at any time.
* Support filtering `oplog` events by `namespaces` (database and collections).
* Uses `eventemitter3` for high performance event emitting.
* Strict and readable code enforced with [xo](https://github.com/sindresorhus/xo)
* Unit tested with `mocha`

## Installation

``` bash
$ npm install git@github.com:jasancheg/x-db-oplog-cursor.git
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

## License

© 2018 [Inidea](http://inideaweb.com).  Made with ♥️  🇨🇷
