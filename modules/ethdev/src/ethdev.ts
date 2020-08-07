import fs from 'fs';
import path from 'path';
import Web3 from 'web3';

import { logger } from 'jege/server';

const log = logger('[ethdev]');

const defaultContractDeployPath = path.resolve(__dirname,
                                               '../deploys/default.json');

export async function deploy(contractBuildFilePath, endpoint, contractFileName,
                             contractName,
                             contractDeployPath = defaultContractDeployPath)
{
  const { contracts } = require(contractBuildFilePath);
  log('deploy(): ethereum endpoint: %s', endpoint);

  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(endpoint));
  const [acc1] = await web3.eth.getAccounts();

  log('contracts is present: %s, contractFileName: %s',
      !!contracts, contractFileName);

  const contractFile = contracts[contractFileName];
  const abi = contractFile[contractName].abi;
  const code = contractFile[contractName].evm.bytecode.object;
  const contract = new web3.eth.Contract(abi);
  const payload = { data: code };

  const con = await contract.deploy(payload).send({
    from: acc1, gas: 6721975, gasPrice: '20000000000',
  });

  log('deploy(): Rand deployed, at address: %s', con.options.address);

  const contractDeployed = {
    options: con.options,
  };
  log('deploy(): write contract deployed to path: %s', contractDeployPath);
  fs.writeFileSync(contractDeployPath,
                   JSON.stringify(contractDeployed, null, 2));

  return {
    con,
    web3,
  };
}

export function getContract(contractDeployedPath) {
  log('getContract(): reading the contract deployed, path: %s',
      contractDeployedPath);

  const raw = fs.readFileSync(contractDeployedPath).toString();
  return JSON.parse(raw);
}
