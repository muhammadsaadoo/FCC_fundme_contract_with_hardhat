const { getNamedAccounts, deployments, network } = require("hardhat");
const {
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
const { Contract } = require("ethers");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments; //pull functions
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChain.includes(network.name)) {
    log("local network detected!!!   Deploying MOCKS.....");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], //decimals and initial answers as constructor parameter
    });
    log("mock deployed!");
  }
};
//to deploy only one script
//comand--> yarn hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"];
