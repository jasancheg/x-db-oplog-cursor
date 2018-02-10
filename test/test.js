'use strict';

/**
 * Module dependencies.
 */
const Stream = require('stream');
const should = require('should');

const MongoClient = require('mongodb').MongoClient;
const MongoOplogCursor = require('../');

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
// Database Name
const dbName = 'local';
// DB instance
let db;
// - and clien
let client;

describe('x-db-oplog-cursor', () => {
  //
  before(done => {
    MongoClient.connect(url, (err, pClient) => {
      if (err) return done(err);
      db = pClient.db(dbName);
      client = pClient;
      done();
    });
  });

  //
  it('should be a function', () => MongoOplogCursor.should.be.a.Function);

  //
  it('should have required methods', done => {
    const cursor = MongoOplogCursor({ db });
    cursor.cursor.should.be.a.Function;
    done();
  });

  //
  it('should get oplog cursor', done => {
    MongoOplogCursor({ db })
      .cursor((err, cursor) => {
        if (err) return done(err);
        cursor.stream().should.be.instanceof(Stream);
        done();
      });
  });

  //
  it('should get oplog cursor from constructor', done => {
    MongoOplogCursor({ db }, (err, cursor) => {
      if (err) return done(err);
      cursor.stream().should.be.instanceof(Stream);
      done();
    });
  });

  //
  after(done => client.close(done));
});
