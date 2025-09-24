const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing CertificateRegistryOptimized with sample certificate...");

  const [deployer, issuer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Issuer:   ${issuer.address}`);

  // Deploy contract with deployer as governance
  const Factory = await ethers.getContractFactory("CertificateRegistryOptimized");
  const contract = await Factory.deploy(deployer.address);
  await contract.deployed();
  console.log(`Contract deployed at: ${contract.address}`);

  // Add issuer
  const addIssuerTx = await contract.addIssuer(issuer.address);
  await addIssuerTx.wait();
  console.log(`Authorized issuer: ${issuer.address}`);

  // Connect as issuer and register a credential
  const asIssuer = contract.connect(issuer);

  const studentIdentifier = "DID:student:alice@example.com";
  const credentialId = "CS-2025-09-001";
  const ipfsHash = "QmZexampleExampleHash";

  const registerTx = await asIssuer.registerCredential(
    studentIdentifier,
    credentialId,
    ipfsHash
  );
  const receipt = await registerTx.wait();
  console.log(`Registered credential. Gas used: ${receipt.gasUsed.toString()}`);

  // Query status
  const [isRevoked, issuerAddr, timestamp] = await contract.getCredentialStatus(credentialId);
  console.log(`Status -> isRevoked: ${isRevoked}, issuer: ${issuerAddr}, issuedAt: ${timestamp}`);

  // Revoke and re-query
  const revokeTx = await asIssuer.revokeCredential(credentialId);
  await revokeTx.wait();
  const [isRevoked2] = await contract.getCredentialStatus(credentialId);
  console.log(`After revoke -> isRevoked: ${isRevoked2}`);

  // Batch register sample
  const ids = ["DID:student:bob@example.com", "DID:student:carol@example.com"]; 
  const creds = ["CS-2025-09-002", "CS-2025-09-003"]; 
  const ipfs = ["QmHashA", "QmHashB"]; 
  const batchTx = await asIssuer.batchRegisterCredentials(ids, creds, ipfs);
  const batchReceipt = await batchTx.wait();
  console.log(`Batch registered 2 credentials. Gas used: ${batchReceipt.gasUsed.toString()}`);

  // Batch query
  const [revokedArr, issuerArr, tsArr] = await contract.batchGetCredentialStatus(creds);
  console.log("Batch query ->", revokedArr, issuerArr, tsArr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

