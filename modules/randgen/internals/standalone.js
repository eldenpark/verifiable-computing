const { argv } = require('yargs');
const childProcess = require('child_process');
const { getContract } = require('ethdev');
const { logger } = require('jege/server');
const path = require('path');
const Web3 = require('web3');

const log = logger('[integration-test]');

async function main()
{
  const { CONTRACT_BUILD_PATH, CONTRACT_DEPLOY_PATH, CONTRACT_FILE_NAME,
          CONTRACT_NAME, ETHEREUM_ENDPOINT, MODE, ADDRESS_ID, RANDGEN_BIN,
          RANDGEN_BIN_PATH, WORKS_PATH, } = process.env;

  const contractBuildFilePath = path.resolve(CONTRACT_BUILD_PATH,
                                             'compiled.json');
  log('main(): contractBuildFilePath: %s', contractBuildFilePath);

  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(ETHEREUM_ENDPOINT));
  const accounts = await web3.eth.getAccounts();
  const con = getContract(CONTRACT_DEPLOY_PATH);

  const randgen = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${accounts[ADDRESS_ID]}`,
      `--ethereumEndpoint=${ETHEREUM_ENDPOINT}`,
      `--worksPath=${WORKS_PATH}`,
      `--mode=${MODE}`,
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process mode: %s, pid: %s, addressId: %s',
      MODE, randgen.pid, ADDRESS_ID);
}

if (require.main === module) {
  main();
}
