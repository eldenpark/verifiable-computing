import { argv } from 'yargs';
import fs from 'fs';
import { logger } from 'jege/server';
import Web3 from 'web3';

const log = logger('[randgen]');

function getContract(ethereumEndpoint, contractBuildFilePath, contractFileName,
                     contractName, contractAddress)
{
  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(ethereumEndpoint));

  const { contracts } = JSON.parse(fs.readFileSync(contractBuildFilePath)
                                     .toString());

  const abi = contracts[contractFileName][contractName].abi;
  const contract = new web3.eth.Contract(abi, contractAddress);
  return contract;
}

async function delegate(opts) {
  const { contractBuildFilePath, contractAddress, myAddress, contractFileName,
          contractName, ethereumEndpoint, } = opts;

  log('delegate(): contractBuildPath: %s, contractAddress: %s, myAddress: %s,'
      + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint);

  const contract = getContract(ethereumEndpoint, contractBuildFilePath,
                               contractFileName, contractName, contractAddress);
  const delegated = await contract.methods.requestDelegate(myAddress, 123)
    .send({ from: myAddress });
  log('delegate(): delegated: %j', delegated);
}

function work(opts) {
  const { contractBuildFilePath, contractAddress, myAddress, contractFileName,
          contractName, ethereumEndpoint, } = opts;

  log('work(): contractBuildFilePath: %s, contractAddress: %s, myAddress: %s,'
      + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint);

  const contract = getContract(ethereumEndpoint, contractBuildFilePath,
                               contractFileName, contractName, contractAddress);

  contract.events.RoundSetup().on('data', (e) => {
    console.log('event handler', e);
  });
}

(async function main() {
  log('main(): argv: %j', argv);

  try {
    if (argv._.includes('work')) {
      work(argv);
    } else if (argv._.includes('delegate')) {
      delegate(argv);
    }
  } catch (err) {
    log('main(): error: %s', err);
  }

  return 0;
})();
