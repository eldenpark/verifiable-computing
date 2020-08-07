const path = require('path');
const { deploy } = require('ethdev');
const { logger } = require('jege/server');

const log = logger('[contract]');

(async function main()
{
  const { CONTRACT_BUILD_PATH, CONTRACT_DEPLOY_PATH, CONTRACT_FILE_NAME,
          CONTRACT_NAME, ETHEREUM_ENDPOINT, RANDGEN_BIN, RANDGEN_BIN_PATH,
          WORKS_PATH, } = process.env;

  const contractBuildFilePath = path.resolve(CONTRACT_BUILD_PATH,
                                             'compiled.json');
  log('main(): contractBuildFilePath: %s', contractBuildFilePath);

  await deploy(contractBuildFilePath, ETHEREUM_ENDPOINT,
               CONTRACT_FILE_NAME, CONTRACT_NAME, CONTRACT_DEPLOY_PATH);
})();
