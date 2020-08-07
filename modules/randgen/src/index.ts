import { argv } from 'yargs';
import childProcess from 'child_process';
import fs from 'fs';
import IPFS from 'ipfs';
import { logger } from 'jege/server';
import NodeRSA from 'node-rsa';
import os from 'os';
import path from 'path';
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

  const node = await IPFS.create({
    repo: os.homedir() + '/.jsipfs2',
  });
  const version = await node.version();
  log('delegate(): ipfs, version: %s', version);

  const dummyTaskPath = path.resolve(__dirname, 'dummy-task/app.js');
  const dummyTask = fs.readFileSync(dummyTaskPath).toString();
  const fileAdded = await node.add({
    path: 'app.js',
    content: dummyTask,
  });
  log('delegate(): added file to ipfs, filePath: %s, cid: %s',
      fileAdded.path, fileAdded.cid);

  const stopped = await node.stop();
  log('delegate(): ipfs, stopped: %s', stopped);

  const requestDelegate = await contract.methods
    .requestDelegate("QmRZG4AnWNk4yop91Zy4D2mNzyQ8s2RhXLfwhDn4je7pfk")
    .send({ from: myAddress });
    log('delegate(): requestDelegate receipt: %j', requestDelegate);
}

async function work(opts)
{
  const { contractBuildFilePath, contractAddress, myAddress, contractFileName,
    contractName, ethereumEndpoint, worksPath, } = opts;

  log('work(): contractBuildFilePath: %s, contractAddress: %s, myAddress: %s,'
      + ' contractFileName: %s, contractName: %s, ethereumEndpoint: %s'
      + ' worksPath: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint, worksPath);

  const contract = getContract(ethereumEndpoint, contractBuildFilePath,
                               contractFileName, contractName, contractAddress);

  let publicKey;
  let privateKey;

  contract.events.Log().on('data', (e) => {
    log('on(): Log: %j', e);
  });

  contract.events.RandCreate().on('data', async (e) => {
    log('on(): RandCreate: %j', e);

    if (e.returnValues.chosen === myAddress) {
      const { workInfo } = e.returnValues;
      log('on(): RandCreate, I am chosen, workInfo: %s', workInfo);
      const node = await IPFS.create();
      const version = await node.version();
      log('work(): ipfs running, version: %s', version);

      const chunks: any = [];
      for await (const chunk of node.cat(workInfo)) {
        chunks.push(chunk);
      }
      const workDownload = Buffer.concat(chunks).toString();
      log('on(): RandCreate, ipfs, work: %s', Buffer.concat(chunks).toString());

      const workFilePath = path.resolve(worksPath, `work-${Date.now()}`);
      fs.writeFileSync(workFilePath, workDownload);

      const command = `node ${workFilePath}`;
      log('on(): RandCreate, work written to path: %s, command: %s',
          workFilePath, command);

      const workDone = childProcess.execSync(command, {
        stdio: 'inherit',
      });

      log('on(): RandCreate, work done: %s', workDone);
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
