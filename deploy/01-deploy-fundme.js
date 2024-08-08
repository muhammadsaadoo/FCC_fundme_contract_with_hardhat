//imports
//main
// cal main

const { getNamedAccounts, deployments, network, get } = require("hardhat");
const { networkConfig, developmentChain } = require("../helper-hardhat-config");

// in hardhat-deployContract

// function deployfundme() {
//   console.log("hi");
// }
// module.exports = deployfundme;
// .....................................................
// module.exports = async (hre) => {
//   //hre-->hardhat runtime enviournment
//   console.log("hello world");
//   // hre.getNamedAccount;
//   hre.deployments;
//   const { getNamedAccount, deployents } = hre; //pull two variables from hre
// };
// .............................................................

// const address = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; //hardcode
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments; //pull functions
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const { verify } = require("../utils/verify");

  //if chainId is X use address y
  //and if chainId is Z use address A
  //use this functionality we use aave protocol

  // const ethUsdPriceFeedAddress = networkConfig["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  // log(ethUsdPriceFeedAddress);

  const args = [ethUsdPriceFeedAddress];
  log("deploing fundme.........");
  const fundme = await deploy("FundMe", {
    contract: "FundMe",
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("deploy successfull....");
  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    //verify
    log("verifying.......");
    await verify(fundme.address, args);
  }
};
module.exports.tags = ["all", "fundme"];
module.exports.tags = ["all", "mocks"];
