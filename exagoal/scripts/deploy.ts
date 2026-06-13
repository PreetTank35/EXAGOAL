import hre from "hardhat";

async function main() {
  console.log("Starting deployment of CredentialRegistry...");

  // 1. Get the Contract Factory
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");

  // 2. Deploy the Contract
  const registry = await CredentialRegistry.deploy();

  // 3. Wait for the deployment transaction to be mined
  await registry.waitForDeployment();

  // 4. Get the deployed address
  const address = await registry.getAddress();

  console.log("\n✅ Successfully deployed!");
  console.log("==================================================");
  console.log("Contract Address:", address);
  console.log("==================================================");
  console.log("\nNext Step:");
  console.log(`Copy the address above and paste it into your .env.local file:`);
  console.log(`CREDENTIAL_REGISTRY_ADDRESS=${address}\n`);
}

// Execute the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
