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

  let test;
  try {
    if (argv.randgen) {
      test = require('../lib/randgen-standalone').default;
    } else {
      test = require('../lib/integration-test').default;
    }
    test();
  } catch (err) {
    log('main(): error: %s', err);
  }
}

if (require.main === module) {
  launch();
}
