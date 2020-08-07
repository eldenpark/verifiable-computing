import { argv } from 'yargs';
import fs from 'fs';
import { logger } from 'jege/server';
import NodeRSA from 'node-rsa';
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

async function delegate(opts)
{
  const { contractBuildFilePath, contractAddress, myAddress, contractFileName,
          contractName, ethereumEndpoint, } = opts;

  log('delegate(): contractBuildPath: %s, contractAddress: %s, myAddress: %s,'
      + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint);

  const contract = getContract(ethereumEndpoint, contractBuildFilePath,
                               contractFileName, contractName, contractAddress);
  const requestDelegate = await contract.methods
    .requestDelegate("some message")
    .send({ from: myAddress });
  log('delegate(): requestDelegate receipt: %j', requestDelegate);
}

function work(opts)
{
  const { contractBuildFilePath, contractAddress, myAddress, contractFileName,
          contractName, ethereumEndpoint, } = opts;

  log('work(): contractBuildFilePath: %s, contractAddress: %s, myAddress: %s,'
      + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint);

  const contract = getContract(ethereumEndpoint, contractBuildFilePath,
                               contractFileName, contractName, contractAddress);

  let publicKey;
  let privateKey;

  contract.events.Log().on('data', (e) => {
    log('on(): Log: %j', e);
  });

  contract.events.RandCreate().on('data', (e) => {
    log('on(): RandCreate: %j', e);

    if (e.returnValues.chosen === myAddress) {
      console.log(11111)

    }
  });

  contract.events.RoundSetup().on('data', async (e) => {
    log('on(): RoundSetup: %j', e);

    const key = new NodeRSA({b: 512});
    publicKey = key.exportKey('public').toString();
    privateKey = key.exportKey('private').toString();
    log('on(): RoundSetup: publicKey: %s, privateKey: %s',
        publicKey, privateKey);

    const bid = await contract.methods.bid(publicKey)
      .send({ from: myAddress, gas: 6721975, gasPrice: '30000000' });
    log('on(): RoundSetup: bid receipt, %j', bid);

  });
}

(async function main()
{
  log('main(): argv: %j', argv);
  log('main(): processId: %s', process.pid);

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
