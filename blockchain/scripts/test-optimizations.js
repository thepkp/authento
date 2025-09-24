const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Certificate Registry Optimizations...");
    
    // Get contract instance (replace with your deployed address)
    const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
    const CertificateRegistryOptimized = await ethers.getContractFactory("CertificateRegistryOptimized");
    const contract = CertificateRegistryOptimized.attach(contractAddress);
    
    // Test data
    const testCredentials = [
        {
            studentId: "STU-001",
            credentialId: "CRED-001",
            ipfsHash: "QmHash1"
        },
        {
            studentId: "STU-002", 
            credentialId: "CRED-002",
            ipfsHash: "QmHash2"
        },
        {
            studentId: "STU-003",
            credentialId: "CRED-003", 
            ipfsHash: "QmHash3"
        }
    ];
    
    console.log("\n📊 Gas Usage Comparison Tests");
    console.log("=" .repeat(50));
    
    // Test 1: Single registration gas usage
    console.log("\n1️⃣ Testing Single Registration...");
    const singleTx = await contract.populateTransaction.registerCredential(
        testCredentials[0].studentId,
        testCredentials[0].credentialId,
        testCredentials[0].ipfsHash
    );
    const singleGasEstimate = await contract.provider.estimateGas(singleTx);
    console.log(`   Single Registration Gas: ${singleGasEstimate.toString()}`);
    
    // Test 2: Batch registration gas usage
    console.log("\n2️⃣ Testing Batch Registration...");
    const batchTx = await contract.populateTransaction.batchRegisterCredentials(
        testCredentials.map(c => c.studentId),
        testCredentials.map(c => c.credentialId),
        testCredentials.map(c => c.ipfsHash)
    );
    const batchGasEstimate = await contract.provider.estimateGas(batchTx);
    console.log(`   Batch Registration Gas: ${batchGasEstimate.toString()}`);
    
    // Calculate efficiency
    const singleTotal = singleGasEstimate.mul(testCredentials.length);
    const batchTotal = batchGasEstimate;
    const efficiency = singleTotal.sub(batchTotal).mul(100).div(singleTotal);
    console.log(`   Batch Efficiency: ${efficiency.toString()}%`);
    
    // Test 3: Query operations
    console.log("\n3️⃣ Testing Query Operations...");
    const queryTx = await contract.populateTransaction.getCredentialStatus("CRED-001");
    const queryGasEstimate = await contract.provider.estimateGas(queryTx);
    console.log(`   Single Query Gas: ${queryGasEstimate.toString()}`);
    
    const batchQueryTx = await contract.populateTransaction.batchGetCredentialStatus(
        testCredentials.map(c => c.credentialId)
    );
    const batchQueryGasEstimate = await contract.provider.estimateGas(batchQueryTx);
    console.log(`   Batch Query Gas: ${batchQueryGasEstimate.toString()}`);
    
    // Test 4: Storage optimization
    console.log("\n4️⃣ Testing Storage Optimization...");
    const storageTx = await contract.populateTransaction.registerCredential(
        "STU-004",
        "CRED-004", 
        "" // Empty IPFS hash
    );
    const storageGasEstimate = await contract.provider.estimateGas(storageTx);
    console.log(`   Storage Optimized Gas: ${storageGasEstimate.toString()}`);
    
    // Test 5: Existence check
    console.log("\n5️⃣ Testing Existence Check...");
    const existsTx = await contract.populateTransaction.credentialExists("CRED-001");
    const existsGasEstimate = await contract.provider.estimateGas(existsTx);
    console.log(`   Existence Check Gas: ${existsGasEstimate.toString()}`);
    
    console.log("\n📈 Optimization Results");
    console.log("=" .repeat(50));
    console.log(`✅ Single Registration: ${singleGasEstimate.toString()} gas`);
    console.log(`✅ Batch Registration: ${batchGasEstimate.toString()} gas`);
    console.log(`✅ Batch Efficiency: ${efficiency.toString()}%`);
    console.log(`✅ Query Optimization: ${queryGasEstimate.toString()} gas`);
    console.log(`✅ Storage Optimization: ${storageGasEstimate.toString()} gas`);
    
    // Performance recommendations
    console.log("\n💡 Performance Recommendations");
    console.log("=" .repeat(50));
    
    if (efficiency.gt(30)) {
        console.log("✅ Excellent batch efficiency - use batch operations for bulk data");
    } else if (efficiency.gt(20)) {
        console.log("✅ Good batch efficiency - consider batch operations");
    } else {
        console.log("⚠️  Low batch efficiency - review batch implementation");
    }
    
    if (queryGasEstimate.lt(3000)) {
        console.log("✅ Excellent query performance - queries are gas efficient");
    } else {
        console.log("⚠️  High query gas usage - consider further optimization");
    }
    
    if (storageGasEstimate.lt(150000)) {
        console.log("✅ Excellent storage optimization - struct packing working well");
    } else {
        console.log("⚠️  High storage gas usage - review struct packing");
    }
    
    console.log("\n🎉 Optimization testing completed!");
    console.log("\n📋 Next Steps:");
    console.log("1. Deploy to testnet with real data");
    console.log("2. Monitor gas usage in production");
    console.log("3. Implement batch operations in frontend");
    console.log("4. Set up gas monitoring dashboard");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Testing failed:", error);
        process.exit(1);
    });

