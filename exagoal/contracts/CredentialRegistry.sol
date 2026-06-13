// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialRegistry
 * @notice On-chain registry for ExaGoal examination credentials.
 * @dev Stores credential hashes with issuer attribution.
 *      Deploy on Polygon PoS for low gas fees.
 */
contract CredentialRegistry {
    struct Credential {
        bytes32 hash;
        address issuer;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bool) public authorizedIssuers;

    address public owner;

    event CredentialAnchored(
        bytes32 indexed hash,
        address indexed issuer,
        uint256 timestamp
    );

    event CredentialRevoked(
        bytes32 indexed hash,
        address indexed revoker
    );

    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @notice Add an authorized issuer (institution wallet)
     */
    function addIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    /**
     * @notice Remove an authorized issuer
     */
    function removeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    /**
     * @notice Anchor a credential hash on-chain
     * @param hash SHA-256 hash of the credential data
     */
    function anchorCredential(bytes32 hash) external onlyIssuer {
        require(credentials[hash].issuedAt == 0, "Already anchored");

        credentials[hash] = Credential({
            hash: hash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false
        });

        emit CredentialAnchored(hash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a credential hash
     * @return exists Whether the credential exists
     * @return issuer The issuer address
     * @return issuedAt Timestamp of issuance
     * @return revoked Whether the credential has been revoked
     */
    function verifyCredential(bytes32 hash)
        external
        view
        returns (
            bool exists,
            address issuer,
            uint256 issuedAt,
            bool revoked
        )
    {
        Credential memory c = credentials[hash];
        return (c.issuedAt > 0, c.issuer, c.issuedAt, c.revoked);
    }

    /**
     * @notice Revoke a previously issued credential
     */
    function revokeCredential(bytes32 hash) external onlyIssuer {
        require(credentials[hash].issuer == msg.sender, "Not the issuer");
        require(!credentials[hash].revoked, "Already revoked");

        credentials[hash].revoked = true;
        emit CredentialRevoked(hash, msg.sender);
    }

    /**
     * @notice Transfer contract ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
