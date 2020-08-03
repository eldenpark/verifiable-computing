const { argv } = require('yargs');
const { createLauncher, proc } = require('process-launch');
const { logger } = require('jege/server');
const path = require('path');

const log = logger('[verifiable-computing]');

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
        NODE_ENV: 'development',
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

    Launcher.run({
      process: argv.process,
      processGroup: argv.processGroup,
    });
  } catch (err) {
    log('launcher(): Error reading file', err);
  }
}

module.exports = launcher;

if (require.main === module) {
  launcher();
}
