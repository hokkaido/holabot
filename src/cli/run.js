const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const toml = require('toml');
const url = require('url');
const chalk = require('chalk');
const winston = require('winston');

const server = require('../server');

const defaultConfigFile = '.hb/config.toml';

const addArguments = (parser) => {
  parser.addArgument([ 'project_path' ],
    { type: 'string', nargs: '?',
      help: 'Change to this directory before serving' });

  parser.addArgument([ '--rdb_db' ],
    { type: 'string', metavar: 'RDB_DB',
      help: 'Name of the RethinkDB database' });

  parser.addArgument([ '--rdb_host' ],
    { type: 'string', metavar: 'RDB_HOST',
      help: 'Host of the RethinkDB server to connect to.' });

  parser.addArgument([ '--rdb_port' ],
    { type: 'string', metavar: 'RDB_PORT',
      help: 'Port of the RethinkDB server to connect to.' });

  parser.addArgument([ '--debug' ],
    { action: 'storeTrue', defaultValue: false,
      help: 'Enable debug logging.' });

  parser.addArgument([ '--config' ],
    { type: 'string', metavar: 'PATH',
      help: 'Path to the config file to use, defaults to "${defaultConfigFile}".' });

  parser.addArgument([ '--holaspirit' ],
    { type: 'string', action: 'append', metavar: 'ID,SECRET', defaultValue: [ ],
      help: 'ID and SECRET of holaspirit api' });
};

const makeDefaultConfig = () => ({
  config: null,
  debug: false,
  // Default to current directory for path
  projectPath: '.',
  rethinkdb: {
    db: null,
    host: 'localhost',
    port: 28015
  },
  slack: {
    token: null
  },
  holaspirit: {
    clientId: null,
    secret: null
  }
});


const defaultConfig = makeDefaultConfig();

const readConfigFromFile = (projectPath, configFile) => {
  const config = { rethinkdb: {}, slack: {}, holaspirit: {} };

  let fileData, configFilename;

  if (configFile) {
    configFilename = configFile;
  } else if (projectPath && !configFile) {
    configFilename = `${projectPath}/${defaultConfigFile}`;
  } else {
    configFilename = defaultConfigFile;
  }

  try {
    fileData = fs.readFileSync(configFilename);
  } catch (err) {
    return config;
  }

  const fileConfig = toml.parse(fileData);
  for (const field in fileConfig) {
    if (defaultConfig[field] !== undefined) {
      config[field] = fileConfig[field];
    } else {
      throw new Error(`Unknown config parameter: "${field}".`);
    }
  }

  return config;
};

const readConfigFromFlags = (parsed) => {
  const config = { rethinkdb: {}, slack: {}, holaspirit: {} };

  if (parsed.rdb_db !== null && parsed.rdb_db !== undefined) {
    config.rethinkdb.db = parsed.rdb_db;
  }
  if (parsed.rdb_host !== null && parsed.rdb_host !== undefined) {
    config.rethinkdb.host = parsed.rdb_host;
  }
  if (parsed.rdb_port !== null && parsed.rdb_port !== undefined) {
    config.rethinkdb.port = parsed.rdb_port;
  }

  if (parsed.debug !== null && parsed.debug !== undefined) {
    config.debug = parsed.debug;
  }

  return config;
}

const mergeConfigs = (oldConfig, newConfig) => {
  for (const key in newConfig) {
    if (['rethinkdb', 'slack', 'holaspirit'].includes(key)) {
      for (const field in newConfig[key]) {
        oldConfig[key][field] = newConfig[key][field]
      }
    } else {
      oldConfig[key] = newConfig[key];
    }
  }
  return oldConfig;
};

const processConfig = (parsed) => {
  let config;

  config = makeDefaultConfig();
  config = mergeConfigs(config,
                         readConfigFromFile(parsed.projectPath, parsed.config));
  config = mergeConfigs(config, readConfigFromFlags(parsed));

  return config;
};

const startHolaBot = (opts) => {
  console.log('Starting HolaBot..');
  const holaBot = new server.Server(opts);
  holaBot.ready().then(() => {
    console.log(chalk.green.bold('HolaBot ready for action'));
  }).catch((err) => {
    console.log(chalk.red.bold(err));
    process.exit(1);
  });

  return holaBot;
};

const runCommand = (opts, done) => {
  if (opts.debug) {
    winston.level = 'debug';
  } else {
    winston.level = 'warn';
  }

  let hbInstance = startHolaBot(opts);


};

module.exports = {
  addArguments,
  processConfig,
  runCommand,
};