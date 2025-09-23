// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @dev A globally-minded smart contract for a Verifiable Credential revocation registry.
 * This contract is designed to be scalable, interoperable, and governed by a consortium.
 */
contract CertificateRegistry {

    // The address of the multi-sig wallet or DAO contract for governance
    address public governanceAddress;

    // A mapping to store addresses of authorized issuing institutions
    mapping(address => bool) public authorizedIssuers;

    // Struct to hold the details of a registered certificate credential
    struct Certificate {
        address issuer;          // Address of the institution that issued it
        string studentIdentifier; // A unique identifier for the student (e.g., DID or email)
        uint256 issueTimestamp;  // When the credential was issued
        bool isRevoked;          // A flag to check if the credential has been revoked
        string credentialId;     // The unique ID from the Verifiable Credential (VC)
        string ipfsHash;         // Optional IPFS hash of the original document
    }

    // Mapping from the credential's unique hash to its details
    // Hashing the credentialId prevents storing unbounded strings directly on-chain
    mapping(bytes32 => Certificate) public credentials;

    // Event to log when a new institution is authorized
    event IssuerAdded(address indexed issuer);
    
    // Event to log when an institution is de-authorized
    event IssuerRemoved(address indexed issuer);

    // Event to log when a new credential is registered
    event CredentialRegistered(
        address indexed issuer,
        bytes32 indexed credentialHash,
        string studentIdentifier
    );

    // Event to log when a credential is revoked
    event CredentialRevoked(
        address indexed issuer,
        bytes32 indexed credentialHash
    );

    // Modifier to restrict functions to the governance contract/wallet
    modifier onlyGovernance() {
        require(msg.sender == governanceAddress, "Only the governance contract can perform this action.");
        _;
    }

    // Modifier to restrict functions to authorized issuers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Caller is not an authorized institution.");
        _;
    }

    // Constructor to set the initial governance address
    constructor(address _initialGovernanceAddress) {
        require(_initialGovernanceAddress != address(0), "Invalid governance address.");
        governanceAddress = _initialGovernanceAddress;
    }

    /**
     * @dev Allows governance to authorize a new institution.
     * @param _issuerAddress The Ethereum address of the institution.
     */
    function addIssuer(address _issuerAddress) public onlyGovernance {
        require(_issuerAddress != address(0), "Invalid issuer address.");
        authorizedIssuers[_issuerAddress] = true;
        emit IssuerAdded(_issuerAddress);
    }

    /**
     * @dev Allows governance to de-authorize an institution.
     * @param _issuerAddress The Ethereum address of the institution.
     */
    function removeIssuer(address _issuerAddress) public onlyGovernance {
        authorizedIssuers[_issuerAddress] = false;
        emit IssuerRemoved(_issuerAddress);
    }

    /**
     * @dev Registers a new credential by storing its details on the blockchain.
     * Can only be called by an authorized institution.
     * @param _studentIdentifier A unique ID for the student.
     * @param _credentialId The unique ID from the Verifiable Credential.
     * @param _ipfsHash The IPFS hash of the raw certificate file (can be an empty string).
     */
    function registerCredential(
        string calldata _studentIdentifier,
        string calldata _credentialId,
        string calldata _ipfsHash
    ) public onlyAuthorizedIssuer {
        bytes32 credentialHash = keccak256(abi.encodePacked(_credentialId));
        require(credentials[credentialHash].issueTimestamp == 0, "This credential has already been registered.");

        credentials[credentialHash] = Certificate({
            issuer: msg.sender,
            studentIdentifier: _studentIdentifier,
            issueTimestamp: block.timestamp,
            isRevoked: false,
            credentialId: _credentialId,
            ipfsHash: _ipfsHash
        });

        emit CredentialRegistered(msg.sender, credentialHash, _studentIdentifier);
    }

    /**
     * @dev Checks the status of a credential.
     * This is a public view function, so it's free to call.
     * @param _credentialId The unique ID of the credential to check.
     * @return A boolean indicating if it's revoked, the issuer's address, and the issue timestamp.
     */
    function getCredentialStatus(string calldata _credentialId) public view returns (bool, address, uint256) {
        bytes32 credentialHash = keccak256(abi.encodePacked(_credentialId));
        Certificate memory cred = credentials[credentialHash];
        // A non-existent credential will return default values (false, address(0), 0)
        return (cred.isRevoked, cred.issuer, cred.issueTimestamp);
    }
    
    /**
     * @dev Revokes a registered credential.
     * Can only be called by the original issuer of the credential.
     * @param _credentialId The unique ID of the credential to revoke.
     */
    function revokeCredential(string calldata _credentialId) public {
        bytes32 credentialHash = keccak256(abi.encodePacked(_credentialId));
        Certificate storage cred = credentials[credentialHash];
        
        require(cred.issueTimestamp != 0, "Credential does not exist.");
        require(msg.sender == cred.issuer, "Only the original issuer can revoke this credential.");
        require(!cred.isRevoked, "Credential has already been revoked.");

        cred.isRevoked = true;
        emit CredentialRevoked(msg.sender, credentialHash);
    }

    /**
     * @dev Allows governance to transfer control to a new governance contract/wallet.
     * @param _newGovernanceAddress The address of the new governance entity.
     */
    function changeGovernance(address _newGovernanceAddress) public onlyGovernance {
        require(_newGovernanceAddress != address(0), "Invalid new governance address.");
        governanceAddress = _newGovernanceAddress;
    }
}
