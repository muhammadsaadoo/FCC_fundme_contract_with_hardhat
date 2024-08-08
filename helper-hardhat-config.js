//11155111
const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
};
//we use these for mock contracts
const developmentChain = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
};
