import { argv } from 'yargs';
import fs from 'fs';
import { logger } from 'jege/server';
import Web3 from 'web3';

const log = logger('[randgen]');

async function delegate() {
  const { contractBuildPath, contractAddress, myAddress, contractFileName,
          contractName, ethereumEndpoint, } = argv;

  log('delegate(): contractBuildPath: %s, contractAddress: %s, myAddress: %s,'
      + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s',
      contractBuildPath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint);

  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(ethereumEndpoint));

  const { contracts } = JSON.parse(fs.readFileSync(contractBuildPath)
                                     .toString());

  const abi = contracts[contractFileName][contractName].abi;
  const contract = new web3.eth.Contract(abi, contractAddress);

  const delegated = await contract.methods.requestDelegate(myAddress, 123)
    .send({ from: myAddress });
  log('delegate(): delegated: %s', delegated);
}

function work() {
  log('work()');
}

(async function main() {
  log('main(): argv: %j', argv);

  try {
    if (argv._.includes('work')) {
      work();
    } else if (argv._.includes('delegate')) {
      await delegate();
    }
  } catch (err) {
    log('main(): error: %s', err);
  }

  return 0;
})();
