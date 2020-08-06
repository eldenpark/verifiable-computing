const childProcess = require('child_process');
const fs = require("fs");
const logger = require('jege/server').logger; const path = require('path');
const Web3 = require('web3');

const CONTRACT_FILE_NAME = 'Rand.sol';
const CONTRACT_NAME = 'Rand';

const log = logger('[contract]');

(function checkRandgenBin() {
  if (process.env.RANDGEN_BIN === undefined) {
    throw new Error('RANDGEN_BIN is not defined');
  }

  if (process.env.RANDGEN_BIN_PATH === undefined) {
    throw new Error('RANDGEN_BIN_PATH is not defined');
  }

  log('checkRandgenBin(): randgen bin: %s, randgen bin path: %s',
      process.env.RANDGEN_BIN, process.env.RANDGEN_BIN_PATH);
})();

async function main() {
  const contractBuildFilePath = path.resolve(process.env.CONTRACT_BUILD_PATH,
                                    'compiled.json');

  log('main(): contractBuildFilePath: %s', contractBuildFilePath);
  const { contracts } = require(contractBuildFilePath);

  const endpoint = process.env.ETHEREUM_ENDPOINT;
  log('deploy(): ethereum endpoint: %s', endpoint);

  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(endpoint));
  const [acc1, acc2, acc3, ...accounts] = await web3.eth.getAccounts();

  const contractFile = contracts[CONTRACT_FILE_NAME];
  const abi = contractFile[CONTRACT_NAME].abi;
  const code = contractFile[CONTRACT_NAME].evm.bytecode.object;
  const contract = new web3.eth.Contract(abi);
  const payload = { data: code };

  const con = await contract.deploy(payload).send({ from: acc2, gas: 6721975,
                                              gasPrice: 20000000000});

  log('main(): Rand deployed, at address: %s', con.options.address);

  const { RANDGEN_BIN, RANDGEN_BIN_PATH } = process.env;

  const worker1 = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc2}`,
      `--ethereumEndpoint=${process.env.ETHEREUM_ENDPOINT}`,
      'work',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  const delegator = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc1}`,
      `--ethereumEndpoint=${process.env.ETHEREUM_ENDPOINT}`,
      'delegate',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  return 0;
};

export default main;
