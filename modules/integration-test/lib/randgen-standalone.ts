import childProcess from 'child_process';
import { deploy } from 'ethdev';
import { logger } from 'jege/server';
import path from 'path';
import { argv } from 'yargs';

import pretest from './pretest';

const log = logger('[integration-test]');

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
  const accounts = await web3.eth.getAccounts();

  const randgen = childProcess.spawn(RANDGEN_BIN,
    [
      RANDGEN_BIN_PATH,
      `--contractBuildFilePath=${contractBuildFilePath}`,
      `--contractFileName=${CONTRACT_FILE_NAME}`,
      `--contractName=${CONTRACT_NAME}`,
      `--contractAddress=${con.options.address}`,
      `--myAddress=${accounts[argv.addressId]}`,
      `--ethereumEndpoint=${ETHEREUM_ENDPOINT}`,
      `--worksPath=${WORKS_PATH}`,
      argv.mode,
    ],
    { stdio: [ process.stdin, process.stdout, process.stderr ]});

  log('main(): spawned child process mode: %s, pid: %s, addressId: %s',
      argv.mode, randgen.pid, argv.addressId);
}

export default main;
