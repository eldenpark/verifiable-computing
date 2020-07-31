const fs = require("fs");
const path = require('path');
const solc = require('solc');
const Web3 = require('web3');

exports.compile = function compile(contractsPath) {
  const sources = {};
  fs.readdirSync(contractsPath)
    .forEach((contract) => {
      if (contract.endsWith('.sol')) {
        const contractPath = path.resolve(contractsPath, contract);
        console.log('compile(): collecting contract, detected at: %s', contractPath);
        sources[contract] = {
          content: fs.readFileSync(contractPath).toString(),
        };
      }
    });

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  output.errors.forEach((error) => {
    console.log(error.formattedMessage);
  });

  return output.contracts;
}

exports.deploy = async function deploy(compiled) {
  const endpoint = 'http://localhost:7545';
  console.log('deploy(): endpoint: %s', endpoint);

  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(endpoint));

  return web3;
  // const deploys = Object.keys(compiled).map((fileName) => {
  //   console.log(1, compiled[fileName])
  //   const { abi } = compiled[fileName];

  //   compiled[fileName].abi;
  // })

  // const abi = compiled['Rand.sol'].abi;
  // const code = compiled['Rand.sol'].code;

  // const contract = new web3.eth.Contract(abi)
  // const account = '0x4D533afCeF8E7C1fE3138AC3297E831d3952ac7d';
  // const payload = { data: code };
  // const parameter = { from: account, gas: 4712388, gasPrice: 100000000000 };

  // return new Promise((resolve) => {
  //   contract.deploy(payload).send(parameter, (err, transactionHash) => {
  //       console.log('Transaction Hash :', transactionHash);
  //   }).on('confirmation', () => {}).then((newContractInstance) => {
  //       console.log('Deployed Contract Address : ',
  //                   newContractInstance.options.address);
  //       resolve({ contract, web3 });
  //   });
  // })
}
