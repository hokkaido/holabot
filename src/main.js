const argparse = require('argparse');
const server = require('./server');
const toml = require('toml');
const chalk = require('chalk');

const runCommand = require('./cli/run');


const parser = new argparse.ArgumentParser();

const subParsers = parser.addSubparsers({
  title: 'commands',
  dest: 'commandName',
});

const runParser = subParsers.addParser('run', {
  addHelp: true,
  help: 'Start HolaBot',
});

runCommand.addArguments(runParser);

const parsed = parser.parseArgs();

const doneCb = (options) => (err) => {
  if (err) {
    console.log(chalk.red.bold(`${parsed.command_name} failed ` +
                               `with ${options.debug ? err.stack : err}`));
    process.exit(1);
  }
};

switch (parsed.commandName) {
  case 'run': {
    const options = runCommand.processConfig(parsed);
    runCommand.runCommand(options, doneCb(options));
    break;
  }
}