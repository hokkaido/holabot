const Botkit = require('botkit');
const r = require('rethinkdb');
const ReqlConnection = require('./reql').ReqlConnection;
const Store = require('./store').Store;
const HolaClient = require('./hola').HolaClient;

class Server {
  constructor(userOpts) {
    const opts = userOpts;

    this._db = new ReqlConnection({
      db: opts.rethinkdb.db,
      host: opts.rethinkdb.host,
      port: opts.rethinkdb.post
    });

    this.hola = new HolaClient(opts.holaspirit);

    this.hola.me.get();

    this.ready().then(() => {
      //this.initBot(opts);
    });

  }

  initBot(opts) {
    this._controller = Botkit.slackbot({
      debug: opts.debug,
      storage: new Store(this._db)
    });

    this._bot = this._controller.spawn({
        token: opts.slack.token
    }).startRTM();

    this._controller.on('hello', (bot, message) => {

      bot.api.users.list({}, (err, response) => {
          if (response.hasOwnProperty('members') && response.ok) {
            r.table('slack_users').insert(response.members).run(this._db.connection());
          }
      });

      // @ https://api.slack.com/methods/channels.list
      bot.api.channels.list({}, (err, response) => {
          if (response.hasOwnProperty('channels') && response.ok) {
            r.table('slack_channels').insert(response.channels).run(this._db.connection());
          }
      });
    });

    this._controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

      bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: 'robot_face',
      }, function(err, res) {
          if (err) {
              bot.botkit.log('Failed to add emoji reaction :(', err);
          }
      });
    });
  }

  spawn() {

  }

  ready() {
    return this._db.ready();
  }
}

module.exports = {
  Server,
};