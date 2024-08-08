require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
const rpc_url = process.env.RPC_URL;
const private_key = process.env.PRIVATE_KEY;
const Etherscan_api = process.env.ETHERSCAN_API_KEY;
const coinmarketapi_key = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: rpc_url,
      accounts: [private_key],
      chainId: 11155111,
      blockConfirmations: 1,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: Etherscan_api,
  },

  gasReporter: {
    enabled: true,
    outputFile: "cheaper_gas_report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: coinmarketapi_key,
    token: "ETH",
    showTimeSpent: true, // Enable verbose logging
    gasPriceApi: Etherscan_api,
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
