const server = require('./server');
const toml = require('toml');
const chalk = require('chalk');

const default_config_file = '.hb/config.toml';

const startHolaBot = (opts) => {
  console.log('Starting HolaBot..');
  const holaBot = server.Server(opts);
  holaBot.ready().then(() => {
    console.log(chalk.green.bold('HolaBot ready for action'));
  }).catch((err) => {
    console.log(chalk.red.bold(err));
    process.exit(1);
  });

  return holaBot;
};
