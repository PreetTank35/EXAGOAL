import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load variables from .env.local
dotenv.config({ path: ".env.local" });

const AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const MAINNET_RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const rawKey = process.env.INSTITUTION_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const PRIVATE_KEY = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Polygon Amoy (Testnet) - Best for testing without spending real money
    amoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    // Polygon PoS (Mainnet) - Use this for actual production
    polygon: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
    }
  },
};

export default config;
