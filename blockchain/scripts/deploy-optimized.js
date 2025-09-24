const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Optimized Certificate Registry...");

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);

    // Get the contract factory
    const CertificateRegistryOptimized = await ethers.getContractFactory("CertificateRegistryOptimized");

    // Deploy the contract with governance address (deployer by default)
    console.log("📝 Deploying contract...");
    const contract = await CertificateRegistryOptimized.deploy(deployer.address);
    await contract.deployed();

    console.log("✅ Contract deployed successfully!");
    console.log(`📍 Contract Address: ${contract.address}`);
    console.log(`🔗 Transaction Hash: ${contract.deployTransaction.hash}`);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const governanceAddress = await contract.governanceAddress();
    console.log(`🏛️  Governance Address: ${governanceAddress}`);

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");

    // Test emergency pause
    const isPaused = await contract.emergencyPause();
    console.log(`⏸️  Emergency Pause: ${isPaused}`);

    // Test max batch size
    const maxBatchSize = await contract.MAX_BATCH_SIZE();
    console.log(`📦 Max Batch Size: ${maxBatchSize.toString()}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Verify contract on Polygon Explorer");
    console.log("2. Add authorized issuers");
    console.log("3. Test batch operations");
    console.log("4. Update frontend integration");

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contract.address,
        transactionHash: contract.deployTransaction.hash,
        governanceAddress: governanceAddress,
        network: (await deployer.provider.getNetwork()).name,
        timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync(
        'deployment-info.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
