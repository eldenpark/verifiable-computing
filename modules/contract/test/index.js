const childProcess = require('child_process');
const fs = require("fs");
const logger = require('jege/server').logger;
const path = require('path');
const Web3 = require('web3');

const CONTRACT_FILE_NAME = 'Rand.sol';
const CONTRACT_NAME = 'Rand';

const { compile, deploy } = require('./ethdev');

const log = logger('[contract]');

(function checkRandgenBin() {
  if (process.env.RANDGEN_BIN === undefined) {
    throw new Error('RANDGEN_BIN is not defined');
  }
  log('checkRandgenBin(): randgen bin: %s', process.env.RANDGEN_BIN);
})();

(async function main() {
  const buildPath = process.env.CONTRACT_BUILD_PATH;
  const contractPath = path.resolve(__dirname, '../contracts');
  const { hasError, contracts } = compile(buildPath, contractPath);

  if (!hasError) {
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

    childProcess.spawnSync(process.env.RANDGEN_BIN
      + ` --contractBuildPath=${buildPath}/compiled.json`
      + ` --contractFileName=${CONTRACT_FILE_NAME}`
      + ` --contractName=${CONTRACT_NAME}`
      + ` --contractAddress=${con.options.address}`
      + ` --myAddress=${acc1}`
      + ` --ethereumEndpoint=${process.env.ETHEREUM_ENDPOINT}`
      + ' delegate',
      null,
      {
        stdio: 'inherit',
      });

    console.log(123123)

    // con.events.RoundSetup().on('data', (e) => {
    //   console.log('event handler', e);
    //   // generates random value...
    // });

    // const b = await con.methods.requestDelegate(acc1, 123).send({
    //   from: acc1,
    // });
    // const bb = await con.methods.requestDelegate(acc3, 3434).send({ from: acc2 });

    // console.log('receipt of firstcall of requestDelegate()', b)
    // console.log('receipt of secondcall, ', bb)
    // randgen.default();
  } else {
    log('main(): solc compilation has error');
  }

  return 0;
})();
