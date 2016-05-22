const assert = require('./error').assert;
const winston = require('winston');
const r = require('rethinkdb');

class ReqlConnection {
  constructor({ host, port, db } = {}) {
    this._host = host;
    this._port = port;
    this._db = db;
    this._connection = undefined;
    this._ready = false;
    this._reconnectDelay = 0;
    this._readyPromise = new Promise((resolve) => this._reconnect(resolve));
    this._closed = false;
    this._hasRetried = false;
  }

  _reconnect(resolve) {
    if (this._connection) {
      this._connection.close();
    }
    this._connection = undefined;
    this._ready = false;

    if (!this._closed) {
      setTimeout(() => this._initConnection(resolve), this._reconnectDelay);
      this._reconnectDelay = Math.min(this._reconnectDelay + 100, 1000);
    }
  }

  _initConnection(resolve) {
    let retried = false;
    const retry = () => {
      if (!retried) {
        retried = true;
        if (!this._ready) {
          this._reconnect(resolve);
        } else {
          this._readyPromise = new Promise((newResolve) => this._reconnect(newResolve));
        }
      }
    };

    if (!this._hasRetried) {
      winston.info(`Connecting to RethinkDB: ${this._host}:${this._port}`);
      this._hasRetried = true;
    }
    r.connect({ host: this._host, port: this._port, db: this._db })
     .then((conn) => {
       winston.debug('Connection to RethinkDB established.');
       conn.once('close', () => {
         retry();
       });
       conn.on('error', (err) => {
         winston.error(`Error on connection to RethinkDB: ${err}.`);
         retry();
       });
       return conn;
     }).then((conn) => {
       this._connection = conn;
       this._reconnect_delay = 0;
       this._ready = true;
       resolve(this);
     }).catch((err) => {
       if (err instanceof r.Error.ReqlDriverError ||
           err instanceof r.Error.ReqlAvailabilityError) {
         winston.debug(`Connection to RethinkDB terminated: ${err}`);
       } else {
         winston.error(`Connection to RethinkDB terminated: ${err}`);
       }
       winston.debug(`stack: ${err.stack}`);
       retry();
     });
  }

  isReady() {
    return this._ready;
  }

  ready() {
    return this._readyPromise;
  }

  connection() {
    assert(this._ready, 'Connection to the database is down.');
    return this._connection;
  }

  close() {
    this._closed = true;
    this._reconnect(); // This won't actually reconnect, but will do all the cleanup
  }
}

module.exports = { ReqlConnection };