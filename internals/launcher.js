const { argv } = require('yargs');
const { createLauncher, proc } = require('process-launch');
const { logger } = require('jege/server');
const path = require('path');

const log = logger('[verifiable-computing]');

const paths = {
  contractBuildPath: path.resolve(__dirname, '../modules/contract/build'),
  contractDeploysPath: path.resolve(__dirname, '../modules/contract/deploys'),
  contractsPath: path.resolve(__dirname, '../modules/contract/contracts'),
  ethdevBuildPath: path.resolve(__dirname, '../modules/ethdev/lib'),
  randgenBuildPath: path.resolve(__dirname, '../modules/randgen/build'),
};

const processDefinitions = {
  'contract:build': proc(
    'node',
    [
      './internals/build.js',
      ...argv._,
    ],
    {
      cwd: `./modules/contract`,
      env: {
        CONTRACTS_PATH: paths.contractsPath,
        CONTRACT_BUILD_PATH: paths.contractBuildPath,
        CONTRACT_DEPLOY_PATH: path.resolve(paths.contractDeploysPath,
                                           'rand.json'),
        ETHEREUM_ENDPOINT: 'ws://localhost:7545',
        NODE_ENV: 'development',
        RANDGEN_BIN: `node`,
        RANDGEN_BIN_PATH: path.resolve(paths.randgenBuildPath, 'index.js'),
      },
      stdio: 'inherit',
    },
  ),
  'contract:deploy': proc(
    'node',
    [
      './internals/deploy.js',
      ...argv._,
    ],
    {
      cwd: `./modules/contract`,
      env: {
        CONTRACT_BUILD_PATH: paths.contractBuildPath,
        CONTRACT_DEPLOY_PATH: path.resolve(paths.contractDeploysPath,
                                           'rand.json'),
        CONTRACT_FILE_NAME: 'Rand.sol',
        CONTRACT_NAME: 'Rand',
        CONTRACTS_PATH: paths.contractsPath,
        ETHEREUM_ENDPOINT: 'ws://localhost:7545',
        NODE_ENV: 'development',
        RANDGEN_BIN: `node`,
        RANDGEN_BIN_PATH: path.resolve(paths.randgenBuildPath, 'index.js'),
      },
      stdio: 'inherit',
    },
  ),
  'ethdev:build': proc(
    'node',
    [
      './internals/build.js',
      ...argv._,
    ],
    {
      cwd: `./modules/ethdev`,
      env: {
        ETHDEV_BUILD_PATH: paths.ethdevBuildPath,
      },
      stdio: 'inherit',
    },
  ),
  'integration-test': proc(
    'node',
    [
      './internals/launch.js',
      `--randgen=${argv.randgen}`,
      `--mode=${argv.mode}`,
      `--addressId=${argv.addressId}`,
      ...argv._,
    ],
    {
      cwd: `./modules/integration-test`,
      env: {
        CONTRACT_FILE_NAME: 'Rand.sol',
        CONTRACT_NAME: 'Rand',
        CONTRACT_BUILD_PATH: paths.contractBuildPath,
        CONTRACT_DEPLOY_PATH: path.resolve(paths.contractDeploysPath,
                                           'rand.json'),
        ETHEREUM_ENDPOINT: 'ws://localhost:7545',
        NODE_ENV: 'development',
        RANDGEN_BIN: `node`,
        RANDGEN_BIN_PATH: `${paths.randgenBuildPath}/index.js`,
        WORKS_PATH: path.resolve(__dirname, '../modules/randgen/works'),
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
        WORKS_PATH: path.resolve(__dirname, '../modules/randgen/works'),
      },
      stdio: 'inherit',
    },
  ),
  'randgen:launch': proc(
    'node',
    [
      './internals/standalone.js',
      ...argv._,
    ],
    {
      cwd: `./modules/randgen`,
      env: {
        ADDRESS_ID: argv.addressId,
        CONTRACT_FILE_NAME: 'Rand.sol',
        CONTRACT_NAME: 'Rand',
        CONTRACT_BUILD_PATH: paths.contractBuildPath,
        CONTRACT_DEPLOY_PATH: path.resolve(paths.contractDeploysPath,
                                           'rand.json'),
        ETHEREUM_ENDPOINT: 'ws://localhost:7545',
        MODE: argv.mode,
        NODE_ENV: 'development',
        RANDGEN_BIN: `node`,
        RANDGEN_BIN_PATH: `${paths.randgenBuildPath}/index.js`,
        WORKS_PATH: path.resolve(__dirname, '../modules/randgen/works'),
      },
      stdio: 'inherit',
    },
  ),
};

const processGroupDefinitions = {
  default: ['integration-test'],
};

const orders = {
  build:    ['ethdev:build', 'randgen:build', 'contract:build'],
  default:  ['ethdev:build', 'randgen:build',
             'integration-test'],
};

function launcher()
{
  try {
    log('launcher(): argv: %j', argv);

    let order = [];
    if (argv.process) {
      order = [argv.process];
    } else {
      order = orders[argv.order] || orders['default'];
    }

    if (argv.c) {
      order.unshift('contract:build');
    }

    const Launcher = createLauncher({
      processDefinitions,
      processGroupDefinitions,
    });

    Launcher.runInSequence({
      order,
    });
  } catch (err) {
    log('launcher(): Error reading file', err);
  }
}

module.exports = launcher;

if (require.main === module) {
  launcher();
}
