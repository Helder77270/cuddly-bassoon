const hre = require("hardhat");

async function main() {
  console.log("Deploying AidChain contracts...");

  // Deploy AID Token first
  const AIDToken = await hre.ethers.getContractFactory("AIDToken");
  const aidToken = await AIDToken.deploy();
  await aidToken.deployed();
  console.log("AID Token deployed to:", aidToken.address);

  // Deploy AidChain contract
  const AidChain = await hre.ethers.getContractFactory("AidChain");
  const aidChain = await AidChain.deploy(aidToken.address);
  await aidChain.deployed();
  console.log("AidChain contract deployed to:", aidChain.address);

  // Set AidChain contract address in AID Token
  await aidToken.setAidChainContract(aidChain.address);
  console.log("AidChain contract address set in AID Token");

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("AID Token:", aidToken.address);
  console.log("AidChain:", aidChain.address);
  console.log("\nSave these addresses to your .env file!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
