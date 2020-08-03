const fs = require("fs");
const logger = require('jege/server').logger;
const path = require('path');
const Web3 = require('web3');

const randgen = require(process.env.RANDGEN_BUILD_PATH);

const { compile, deploy } = require('./ethdev');

const log = logger('[contract]');

(async function main() {
  const buildPath = path.resolve(__dirname, '../build');
  const contractPath = path.resolve(__dirname, '../contracts');
  const { hasError, contracts } = compile(buildPath, contractPath);

  if (!hasError) {
    const endpoint = 'ws://localhost:7545';
    console.log('deploy(): endpoint: %s', endpoint);

    const web3 = new Web3();
    web3.setProvider(new web3.providers.WebsocketProvider(endpoint));
    const [acc1, acc2, acc3, ...accounts] = await web3.eth.getAccounts();

    const abi = contracts['Rand.sol']['Rand'].abi;
    const code = contracts['Rand.sol']['Rand'].evm.bytecode.object;
    const contract = new web3.eth.Contract(abi);
    const payload = { data: code };

    const con = await contract.deploy(payload).send({ from: acc2, gas: 6721975,
                                                gasPrice: 20000000000});
    con.events.RoundSetup().on('data', (e) => {
      console.log('event handler', e);
      // generates random value...
    });

    const b = await con.methods.requestDelegate(acc1, 123).send({
      from: acc1,
    });
    const bb = await con.methods.requestDelegate(acc3, 3434).send({ from: acc2 });
    // await con.methods.requestDelegate(acc1, 2323).call({ from: acc2 });

    console.log('receipt of firstcall of requestDelegate()', b)
    console.log('receipt of secondcall, ', bb)
    randgen.default();
  } else {
    log('main(): solc compilation has error');
  }

  return 0;
})();
