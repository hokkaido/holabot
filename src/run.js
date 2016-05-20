
const addArguments = (parser) => {
  parser.addArgument([ 'project_path' ],
    { type: 'string', nargs: '?',
      help: 'Change to this directory before serving' });

  parser.addArgument([ '--db', '-n' ],
    { type: 'string', action: 'store', metavar: 'NAME',
      help: 'Name of the RethinkDB database' });

  parser.addArgument([ '--connect', '-c' ],
    { type: 'string', metavar: 'HOST:PORT',
      help: 'Host and port of the RethinkDB server to connect to.' });

  parser.addArgument([ '--debug' ],
    { type: 'string', metavar: 'yes|no', constant: 'yes', nargs: '?',
      help: 'Enable debug logging.' });

  parser.addArgument([ '--config' ],
    { type: 'string', metavar: 'PATH',
      help: 'Path to the config file to use, defaults to "${default_config_file}".' });

  parser.addArgument([ '--holaspirit' ],
    { type: 'string', action: 'append', metavar: 'ID,SECRET', defaultValue: [ ],
      help: 'ID and SECRET of holaspirit api' });
};