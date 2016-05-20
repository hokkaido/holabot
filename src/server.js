const Botkit = require('botkit');
var r = require('rethinkdb');

class Server {
  constructor(userOpts) {
    const opts = userOpts;

    this._bot = Botkit.slackbot({
      debug: false
      //include "log: false" to disable logging
      //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    });

    this._db = r.connect({
      db: opts.rdb.db,
      host: opts.rdb.host,
      port: opts.rdb.post
    });
  }

  spawn() {

  }

  ready() {
    return this._db.ready();
  }
}