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
          contractName, ethereumEndpoint, name, } = opts;

  log('delegate(): contractBuildPath: %s, contractAddress: %s, myAddress: %s,'
      + ' contractFileName: %s, contractName: %s, ethereumEndpoint: %s',
      + ' name: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint, name);

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

  try {
    const requestDelegate = await contract.methods
      .requestDelegate("QmRZG4AnWNk4yop91Zy4D2mNzyQ8s2RhXLfwhDn4je7pfk")
      .send({ from: myAddress, gas: 6721975, gasPrice: '30000000' });
      log('delegate(): requestDelegate receipt: %s',
          requestDelegate.transactionHash);
  } catch (err) {
    log('delegate(): request delegate error: %s', err);
  }
}

async function work(opts)
{
  const privKey = Math.floor(Math.random() * 9) + 1;
  const pubKey =  10 - privKey;

  const { contractBuildFilePath, contractAddress, myAddress, contractFileName,
    contractName, ethereumEndpoint, name, worksPath, } = opts;

  log('work(): contractBuildFilePath: %s, contractAddress: %s, myAddress: %s,'
      + ' contractFileName: %s, contractName: %s, ethereumEndpoint: %s'
      + ' name: %s, worksPath: %s, privKey: %s',
      contractBuildFilePath, contractAddress, myAddress, contractFileName,
      contractName, ethereumEndpoint, name, worksPath, privKey);

  const contract = getContract(ethereumEndpoint, contractBuildFilePath,
                               contractFileName, contractName, contractAddress);

  contract.events.Log().on('data', (e) => {
    log('on data(): [%s] Log: %j', name, e.returnValues);
  });

  contract.events.VolunteerChoose().on('data', async (e) => {
    log('on data(): [%s] VolunteerChoose: %j', name, e.returnValues);
    const { volunteers } = e.returnValues;
    if (volunteers.includes(myAddress)) {
      const _privKey = privKey.toString();
      const revealSecret = await contract.methods.revealSecret(_privKey)
        .send({ from: myAddress, gas: 6721975, gasPrice: '30000000' });

      log('on data(): [%s] VolunteerChoose: revealSecret receipt, %s',
          name, revealSecret.transactionHash);
    }
  });

  contract.events.RandCreate().on('data', async (e) => {
    log('on data(): RandCreate: %j', e);

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
    log('on(): RoundSetup: pubKey: %s, privKey: %s, start bidding...',
        pubKey, privKey);

    const bid = await contract.methods.bid(pubKey.toString())
      .send({ from: myAddress, gas: 6721975, gasPrice: '30000000' });
    log('on(): RoundSetup: bid receipt, %s', bid.transactionHash);
  });
}

(async function main()
{
  log('main(): argv: %j', argv);
  log('main(): processId: %s', process.pid);

  try {
    if (argv.mode === 'work') {
      work(argv);
    } else if (argv.mode === 'delegate') {
      delegate(argv);
    } else {
      throw new Error('mode is not properly set up');
    }
  } catch (err) {
    log('main(): error: %s', err);
  }

  return 0;
})();
