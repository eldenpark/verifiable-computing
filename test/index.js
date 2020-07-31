const fs = require("fs");
const path = require('path');
const { compile, deploy } = require('./deployUtils');
const Web3 = require('web3');

(async () => {
  const contractPath = path.resolve(__dirname, '../contracts');
  const compiled = compile(contractPath);

  const endpoint = 'http://localhost:7545';
  console.log('deploy(): endpoint: %s', endpoint);

  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(endpoint));

  const [acc1, acc2, ...accounts] = await web3.eth.getAccounts();

  // console.log(compiled);

  const abi = compiled['Rand.sol']['Rand'].abi;
  const code = compiled['Rand.sol']['Rand'].evm.bytecode.object;

  const contract = new web3.eth.Contract(abi);
  const payload = { data: code };

  const con = await contract.deploy(payload).send({ from: acc1, gas: 1500000,
                                              gasPrice: '30000000000000' });
  console.log(1, con);



  return 0;
  // console.log(1, compiled);
  // const { contract, web3 } = deploy(compiled);
  // const accounts = [
  //   '0x4D533afCeF8E7C1fE3138AC3297E831d3952ac7d',
  //   '0x2B2469fF2Cb8b7dD6eBB30c461565BF10dc45852',
  // ];

  // contract.methods.requestDelegate(accounts[0], 10)
  //   .call()
  //   .then((a) => {
  //     console.log(1, a);
  //   })

})();
