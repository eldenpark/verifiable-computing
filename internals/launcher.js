const { argv } = require('yargs');
const { createLauncher, proc } = require('process-launch');
const { logger } = require('jege/server');
const path = require('path');

const log = logger('[verifiable-computing]');

const paths = {
  contractBuildPath: path.resolve(__dirname, '../modules/contract/build'),
  randgenBuildPath: path.resolve(__dirname, '../modules/randgen/build'),
};

const processDefinitions = {
  'contract:test': proc(
    'node',
    [
      './test/index.js',
      ...argv._,
    ],
    {
      cwd: `./modules/contract`,
      env: {
        CONTRACT_BUILD_PATH: paths.contractBuildPath,
        ETHEREUM_ENDPOINT: 'ws://localhost:7545',
        NODE_ENV: 'development',
        RANDGEN_BIN: `node ${paths.randgenBuildPath}/index.js`,
      },
      stdio: 'inherit',
    },
  ),
  'randgen:build': proc(
    'node',
    [
      './internals/build.js',
      ...argv._,
    ],
    {
      cwd: `./modules/randgen`,
      env: {
        NODE_ENV: 'development',
        RANDGEN_BUILD_PATH: paths.randgenBuildPath,
      },
      stdio: 'inherit',
    },
  ),
};

const processGroupDefinitions = {
  default: ['contract:test'],
};

function launcher() {
  try {
    log('launcher(): argv: %j', argv);

    const Launcher = createLauncher({
      processDefinitions,
      processGroupDefinitions,
    });

    Launcher.runInSequence({
      order: ['randgen:build', 'contract:test'],
    });
  } catch (err) {
    log('launcher(): Error reading file', err);
  }
}

module.exports = launcher;

if (require.main === module) {
  launcher();
}
