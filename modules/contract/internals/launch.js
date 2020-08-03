const { argv } = require('yargs');
const { logger } = require('jege/server');

const babelRc = require('./.babelrc');
const { gulp } = require('./build');

const log = logger('[contract]');

require('@babel/register')({
  ...babelRc,
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

function launch() {
  log('CURRENTLY_NOT_USED launch(): argv: %j', argv);
}

if (require.main === module) {
  launch();
}
