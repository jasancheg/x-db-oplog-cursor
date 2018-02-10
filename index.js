/**
 * Module dependencies.
 */
const debug = require('debug')('x-db-oplog-cursor');
const Timestamp = require('x-timestamp-bson');

const cursor = {
  cursor: get,
  timestamp,
  create,
  init
};

module.exports = Factory;
/** ****************** */

/**
 * Create cursor object.
 *
 * @param {Object} options
 * @param {Function} [fn]
 * @return {Cursor}
 * @api public
 */
function Factory(options, fn) {
  const cur = cursor.create(options);
  return fn ? cur.cursor(fn) : cur;
}

/**
 * Namespace regex builder.
 *
 * @param {String} pattern
 * @return {RegExp} regular expresion
 * @api private
 */
function regex(pattern = '*') {
  pattern = pattern.replace(/[\*]/g, '(.*?)');
  return new RegExp(`^${pattern}`, 'i');
}

/**
 * Create a cursor object.
 *
 * @param {Object} options
 * @return {Cursor}
 * @api public
 */
function create(options) {
  return Object.create(this).init(options);
}

/**
 * Initialize cursor object.
 *
 * @param {Object} options
 * @return {Cursor} this
 * @api private
 */
function init({ db, ns, ts, coll }) {
  if (!db) throw new Error('Mongo db is missing.');

  this.db = db;
  this.ns = ns;
  this.ts = ts;
  this.cn = coll || 'oplog.rs';
  this.coll = this.db.collection(this.cn);

  return this;
}

/**
 * Get cursor.
 *
 * @param {Function} fn
 * @api public
 */
function get(fn) {
  const coll = this.coll;
  const ns = this.ns;
  const query = {};

  if (ns) query.ns = { $regex: regex(ns) };

  this.timestamp((err, ts) => {
    if (err) return fn(err);

    query.ts = { $gt: ts };

    const newCursor = coll.find(query);
    newCursor.addCursorFlag('tailable', true);
    newCursor.addCursorFlag('awaitData', true);
    newCursor.addCursorFlag('oplogReplay', true);
    newCursor.addCursorFlag('noCursorTimeout', true);
    newCursor.setCursorOption('numberOfRetries', Number.MAX_VALUE);

    debug('Success', 'New cursor created');
    fn(null, newCursor);
  });

  return this;
}

/**
 * Get cursor query timestamp.
 *
 * @param {Function} fn
 * @api private
 */
function timestamp(fn) {
  const coll = this.coll;
  let ts = this.ts;

  if (ts) return fn(null, typeof ts !== 'number' ? ts : Timestamp(0, ts));

  coll
    .find({}, { ts: 1 })
    .sort({ $natural: -1 })
    .limit(1)
    .next((err, doc) => {
      if (err) return fn(err);

      ts = doc
         ? doc.ts
         : Timestamp(0, (Date.now() / 1000 | 0));

      fn(null, ts);
    });
}
