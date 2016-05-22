const r = require('rethinkdb');

class Table {
  constructor(conn, tableName) {
    this._conn = conn;
    this._tableName = tableName;
  }
  
  get(id, cb) {
    return r.table(this._tableName).get(id).run(this._conn, cb);
  }
  
  all(cb) {
    return r.table(this._tableName).getAll().run(this._conn, cb);
  }
  
  save(data, cb) {
    return r.table(this._tableName).insert(data).run(this._conn, cb);
  }
}

class Store {
  constructor(db) {
    this._db = db;
    this.teams = new Table(db.connection(), 'slack_teams');
    this.channels = new Table(db.connection(), 'slack_channels');
    this.users = new Table(db.connection(), 'slack_users');
  }
}

module.exports = {
  Store
}