const fs = require("fs");
const logger = require('jege/server').logger;
const path = require('path');
const solc = require('solc');
const Web3 = require('web3');

const log = logger('[contract]');

exports.compile = function compile(contractsPath) {
  const sources = {};

  if (!fs.existsSync(contractsPath)) {
    log('compile(): contractsPath does not exist');
    throw new Error('contractsPath does not exist');
  }

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
  log('compile(): solc finish compilation: %j', output);

  output.errors.forEach((error) => {
    console.log(error.formattedMessage);
    if (error.severity === 'error') {
      output.hasError = true;
    }
  });

  return output;
}
