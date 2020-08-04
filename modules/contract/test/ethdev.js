const fs = require("fs");
const logger = require('jege/server').logger;
const path = require('path');
const solc = require('solc');
const Web3 = require('web3');

const log = logger('[contract]');

exports.compile = function compile(buildPath, contractsPath) {
  const sources = {};

  if (!fs.existsSync(buildPath)) {
    log('compile(): buildPath does not exist, path: %s', buildPath);
    throw new Error('buildPath does not exist');
  }

  if (!fs.existsSync(contractsPath)) {
    log('compile(): contractsPath does not exist, path: %s', contractsPath);
    throw new Error('contractsPath does not exist');
  }

  log('compile(): buildPath: %s, contractsPath:%s', buildPath, contractsPath);

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

  const compileReceiptPath = path.resolve(buildPath, 'compiled.json');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  fs.writeFileSync(compileReceiptPath, JSON.stringify(output, null, 2));

  output.errors.forEach((error) => {
    console.log(error.formattedMessage);
    if (error.severity === 'error') {
      output.hasError = true;
    }
  });

  if (!output.hasError) {
    for (let contractFile in output.contracts) {
      for (let contract in output.contracts[contractFile]) {
        log('compile(): contract compiled, name: %s, at file: %s', contract, contractFile);
      }
    }
  }

  return output;
}
