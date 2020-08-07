import Web3 from 'web3';

import { logger } from 'jege/server';

const log = logger('[ethdev]');

export async function deploy(contractBuildFilePath, endpoint, contractFileName,
                             contractName)
{
  const { contracts } = require(contractBuildFilePath);
  log('deploy(): ethereum endpoint: %s', endpoint);

  const web3 = new Web3();
  web3.setProvider(new Web3.providers.WebsocketProvider(endpoint));
  const [acc1, acc2, acc3, ...accounts] = await web3.eth.getAccounts();

  const contractFile = contracts[contractFileName];
  const abi = contractFile[contractName].abi;
  const code = contractFile[contractName].evm.bytecode.object;
  const contract = new web3.eth.Contract(abi);
  const payload = { data: code };

  const con = await contract.deploy(payload).send({
    from: acc2, gas: 6721975, gasPrice: '20000000000',
  });

  log('deploy(): Rand deployed, at address: %s', con.options.address);

  return {
    con,
    web3,
  };
}
