import childProcess from 'child_process';
import { deploy } from 'ethdev';
import { logger } from 'jege/server';
import path from 'path';

import pretest from './pretest';

const log = logger('[integration-test]');

function delay(ms = 1000)
{
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main()
{
  pretest();

  const { CONTRACT_BUILD_PATH, CONTRACT_FILE_NAME, CONTRACT_NAME,
          ETHEREUM_ENDPOINT, RANDGEN_BIN, RANDGEN_BIN_PATH,
          WORKS_PATH, } = process.env;

  const contractBuildFilePath = path.resolve(CONTRACT_BUILD_PATH,
                                             'compiled.json');
  log('main(): contractBuildFilePath: %s', contractBuildFilePath);

  const { con, web3 } = await deploy(contractBuildFilePath, ETHEREUM_ENDPOINT,
                                     CONTRACT_FILE_NAME, CONTRACT_NAME);
  const [acc1, acc2, acc3, acc4] = await web3.eth.getAccounts();

  const worker1 = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc2}`,
      `--ethereumEndpoint=${ETHEREUM_ENDPOINT}`,
      `--worksPath=${WORKS_PATH}`,
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
      `--ethereumEndpoint=${ETHEREUM_ENDPOINT}`,
      `--worksPath=${WORKS_PATH}`,
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
      `--ethereumEndpoint=${ETHEREUM_ENDPOINT}`,
      `--worksPath=${WORKS_PATH}`,
      'work',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process [worker3], pid: %s', worker3.pid);

  await delay(1000);

  const delegator1 = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${acc1}`,
      `--ethereumEndpoint=${ETHEREUM_ENDPOINT}`,
      `--worksPath=${WORKS_PATH}`,
      'delegate',
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process [delegator1], pid: %s', delegator1.pid);

  return 0;
};

export default main;
