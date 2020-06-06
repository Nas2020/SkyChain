const Aircraft = artifacts.require("Aircraft");

module.exports = function(deployer) {
  deployer.deploy(Aircraft, "https://www.nlmuasys.com");
};
