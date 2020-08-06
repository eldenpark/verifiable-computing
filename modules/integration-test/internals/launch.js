const { argv } = require('yargs');
const { logger } = require('jege/server');

const babelRc = require('./.babelrc');

const log = logger('[integration-test]');

require('@babel/register')({
  ...babelRc,
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

function launch() {
  log('launch(): argv: %j', argv);

  const test = require('../lib/integration-test').default;
  test();
}

if (require.main === module) {
  launch();
}
