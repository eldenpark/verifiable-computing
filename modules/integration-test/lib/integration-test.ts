const childProcess = require('child_process');
const fs = require("fs");
const logger = require('jege/server').logger; const path = require('path');
const Web3 = require('web3');

const CONTRACT_FILE_NAME = 'Rand.sol';
const CONTRACT_NAME = 'Rand';

const log = logger('[contract]');

(function checkRandgenBin()
{
  if (process.env.RANDGEN_BIN === undefined) {
    throw new Error('RANDGEN_BIN is not defined');
  }

  if (process.env.RANDGEN_BIN_PATH === undefined) {
    throw new Error('RANDGEN_BIN_PATH is not defined');
  }

  log('checkRandgenBin(): randgen bin: %s, randgen bin path: %s',
      process.env.RANDGEN_BIN, process.env.RANDGEN_BIN_PATH);
})();

async function deploy(contractBuildFilePath, endpoint)
{
  const { contracts } = require(contractBuildFilePath);
  log('deploy(): ethereum endpoint: %s', endpoint);

  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(endpoint));
  const [acc1, acc2, acc3, ...accounts] = await web3.eth.getAccounts();

  const contractFile = contracts[CONTRACT_FILE_NAME];
  const abi = contractFile[CONTRACT_NAME].abi;
  const code = contractFile[CONTRACT_NAME].evm.bytecode.object;
  const contract = new web3.eth.Contract(abi);
  const payload = { data: code };

  const con = await contract.deploy(payload).send({
    from: acc2, gas: 6721975, gasPrice: 20000000000});

  log('deploy(): Rand deployed, at address: %s', con.options.address);

  return {
    con,
    web3,
  };
}

function delay(ms = 1000)
{
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main()
{
  const contractBuildFilePath = path.resolve(process.env.CONTRACT_BUILD_PATH,
                                    'compiled.json');

  log('main(): contractBuildFilePath: %s', contractBuildFilePath);
  const endpoint = process.env.ETHEREUM_ENDPOINT;
  const { con, web3 } = await deploy(contractBuildFilePath, endpoint);
  const [acc1, acc2, acc3, acc4] = await web3.eth.getAccounts();

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
      `--worksPath=${process.env.WORKS_PATH}`,
      'work',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process [worker1], pid: %s', worker1.pid);

  const worker2 = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc3}`,
      `--ethereumEndpoint=${process.env.ETHEREUM_ENDPOINT}`,
      `--worksPath=${process.env.WORKS_PATH}`,
      'work',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process [worker2], pid: %s', worker2.pid);

  const worker3 = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc4}`,
      `--ethereumEndpoint=${process.env.ETHEREUM_ENDPOINT}`,
      `--worksPath=${process.env.WORKS_PATH}`,
      'work',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process [worker3], pid: %s', worker2.pid);

  await delay(1000);

  const delegator1 = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc1}`,
      `--ethereumEndpoint=${process.env.ETHEREUM_ENDPOINT}`,
      `--worksPath=${process.env.WORKS_PATH}`,
      'delegate',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process [delegator1], pid: %s', delegator1.pid);

  return 0;
};

export default main;
