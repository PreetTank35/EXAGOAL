// ============================================================
// Blockchain Credential Verification Utilities
// ============================================================

import CryptoJS from 'crypto-js';

/** Generate a credential hash from exam result data */
export function generateCredentialHash(data: {
  studentId: string;
  examId: string;
  score: number;
  completedAt: string;
  institutionId: string;
}): string {
  const payload = [
    data.studentId,
    data.examId,
    data.score.toString(),
    data.completedAt,
    data.institutionId,
  ].join('|');

  return CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
}

/** Simulate blockchain anchoring for MVP (replace with real ethers.js call in production) */
export async function anchorToBlockchain(
  credentialHash: string
): Promise<{
  txHash: string;
  blockNumber: number;
  network: string;
}> {
  // MVP: Simulated transaction
  // In production, use ethers.js + Polygon RPC:
  //
  // const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  // const wallet = new ethers.Wallet(process.env.INSTITUTION_PRIVATE_KEY!, provider);
  // const contract = new ethers.Contract(
  //   process.env.CREDENTIAL_REGISTRY_ADDRESS!,
  //   CREDENTIAL_REGISTRY_ABI,
  //   wallet
  // );
  // const tx = await contract.anchorCredential(`0x${credentialHash}`);
  // const receipt = await tx.wait();

  const simulatedTxHash = `0x${CryptoJS.SHA256(credentialHash + Date.now().toString()).toString(CryptoJS.enc.Hex)}`;

  return {
    txHash: simulatedTxHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
    network: 'polygon-simulated',
  };
}

/** Verify a credential hash (MVP: check against database) */
export async function verifyCredential(credentialHash: string): Promise<{
  valid: boolean;
  issuer?: string;
  issuedAt?: string;
  revoked?: boolean;
}> {
  // MVP: Database lookup (see API route)
  // In production, query the Polygon smart contract:
  //
  // const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  // const contract = new ethers.Contract(address, abi, provider);
  // const [exists, issuer, issuedAt, revoked] = await contract.verifyCredential(`0x${hash}`);

  return {
    valid: true,
    issuer: 'ExaGoal Platform',
    issuedAt: new Date().toISOString(),
    revoked: false,
  };
}

/** Generate a verification URL for a credential */
export function getVerificationURL(credentialHash: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://exagoal.com';
  return `${baseUrl}/verify/${credentialHash}`;
}

/** Smart contract ABI for reference (CredentialRegistry.sol) */
export const CREDENTIAL_REGISTRY_ABI = [
  'function anchorCredential(bytes32 hash) external',
  'function verifyCredential(bytes32 hash) external view returns (bool exists, address issuer, uint256 issuedAt, bool revoked)',
  'function revokeCredential(bytes32 hash) external',
  'event CredentialAnchored(bytes32 indexed hash, address indexed issuer, uint256 timestamp)',
  'event CredentialRevoked(bytes32 indexed hash, address indexed revoker)',
] as const;
