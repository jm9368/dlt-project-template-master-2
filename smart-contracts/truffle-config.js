/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

"use strict";

require('dotenv').config(); // Load config

const PrivateKeyProvider = require("@truffle/hdwallet-provider");
const FS = require("fs");
const Path = require("path");
let privateKey = [];

try {
  privateKey = FS.readFileSync(Path.resolve(__dirname, "key")).toString().trim().split("\n");
} catch (ex) {
  throw new Error("Could not access the private key file. Create a file with name 'key' in order to use a private key for deployment. " + ex.message);
}

const DevNetworkConfig = {
  protocol: process.env.DEV_NETWORK_PROTOCOL || "http",
  host: process.env.DEV_NETWORK_HOST || "localhost",
  port: parseInt(process.env.DEV_NETWORK_PORT || "8545", 10),
  id: process.env.DEV_NETWORK_ID || "*",
  gasPrice: process.env.DEV_NETWORK_GAS_PRICE || "0",
};

const ProdNetworkConfig = {
  protocol: process.env.PROD_NETWORK_PROTOCOL || "http",
  host: process.env.PROD_NETWORK_HOST || "localhost",
  port: parseInt(process.env.PROD_NETWORK_PORT || "8545", 10),
  id: process.env.PROD_NETWORK_ID || "*",
  gasPrice: process.env.PROD_NETWORK_GAS_PRICE || "0",
};

module.exports = {
  networks: {
    development: {
      host: DevNetworkConfig.host,
      port: DevNetworkConfig.port,
      network_id: DevNetworkConfig.id,
      provider: () => new PrivateKeyProvider(privateKey, `${DevNetworkConfig.protocol}://${DevNetworkConfig.host}:${DevNetworkConfig.port}`),
      gasPrice: DevNetworkConfig.gasPrice,
    },

    production: {
      host: ProdNetworkConfig.host,
      port: ProdNetworkConfig.port,
      network_id: ProdNetworkConfig.id,
      provider: () => new PrivateKeyProvider(privateKey, `${ProdNetworkConfig.protocol}://${ProdNetworkConfig.host}:${ProdNetworkConfig.port}`),
      gasPrice: ProdNetworkConfig.gasPrice,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: process.env.SOLC_VERSION || "0.8.1",       // Fetch exact version from solc-bin (default: truffle's version)

      settings: {
        optimizer: {
          enabled: true,
          runs: 1,
        },
      },
    }
  },
}