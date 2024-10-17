import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import "./scripts/deployERC20";
import "./scripts/increaseTime";
import "./scripts/upgradePairs";
import "./scripts/upgradeRouter";
import "./scripts/upgradeLaunchpair";
import "./scripts/upgradeGovernance";
import "./scripts/createPair";
import "./scripts/takeProtocolFees";
import "./scripts/upgradeADEX";
import "./scripts/upgradeLPToken";
import "./scripts/verifyAllContracts";

import "hardhat-contract-sizer";
import "@openzeppelin/hardhat-upgrades";

// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
        runs: 150,
      },
    },
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      mining: { auto: true, interval: 12_000 },
    },
    opencampus: {
      url: "https://rpc.open-campus-codex.gelato.digital",
      accounts: [deployerPrivateKey],
    },
    neox: {
      url: "https://neoxt4seed1.ngd.network",
      accounts: [deployerPrivateKey],
      gasPrice: 40000000000,
    },
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: { opencampus: "NOT NEEDED", neox: "NOT NEEDED" },
    customChains: [
      {
        network: "opencampus",
        chainId: 656476,
        urls: {
          apiURL: "https://edu-chain-testnet.blockscout.com/api",
          browserURL: "https://edu-chain-testnet.blockscout.com",
        },
      },
      {
        network: "neox",
        chainId: 12227332,
        urls: {
          apiURL: "https://xt4scan.ngd.network/api",
          browserURL: "https://xt4scan.ngd.network",
        },
      },
    ],
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
