const Rand = artifacts.require('Rand');

module.exports = function(deployer) {
  deployer.deploy(Rand);
};
