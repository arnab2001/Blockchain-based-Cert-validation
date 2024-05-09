// Allows us to use ES6 in our migrations and tests.
require("babel-register");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require("dotenv").config();
module.exports = {
  networks: {
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          //"https://eth-sepolia.g.alchemy.com/v2/kE3guiCdVFKd44_IAIriMKcEV2XRPd9t" // Update with your Alchemy API key
          process.env.PROJECT_ENDPOINT
        );
      },
      network_id: 11155111, // Polygon Mumbai testnet network ID
      gas: 8000000, // Gas limit used for deploys
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true // Skip dry run before migrations? (default: false for public nets )
    },
    
    development: {
      host: process.env.LOCAL_ENDPOINT.split(":")[1].slice(2),
      port: process.env.LOCAL_ENDPOINT.split(":")[2],
      network_id: process.env.NETWORK_ID
    }
  }
};

