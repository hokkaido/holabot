const Botkit = require('botkit');

class Server {
  constructor(userOpts) {
    const opts = userOpts;

    this._bot = Botkit.slackbot({
      debug: false
      //include "log: false" to disable logging
      //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    });
  }

  spawn() {

  }
}