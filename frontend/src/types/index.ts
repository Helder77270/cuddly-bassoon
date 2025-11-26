/**
 * Type definitions for AidChain Frontend
 */

// Project types
export interface Project {
  id: string;
  creator: string;
  name: string;
  description: string;
  ipfsHash: string;
  fundingGoal: string;
  fundsRaised: string;
  createdAt: Date;
  active: boolean;
  zkKYCVerified: boolean;
  reputationScore: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  description: string;
  fundingAmount: string;
  proofIPFSHash: string;
  completed: boolean;
  approved: boolean;
  votesFor: string;
  votesAgainst: string;
  votingDeadline: Date;
}

export interface Donation {
  donor: string;
  amount: string;
  timestamp: Date;
  projectId: string;
}

// Form data types
export interface ProjectFormData {
  name: string;
  description: string;
  fundingGoal: string;
  location: string;
  category: string;
}

// IPFS types
export interface IPFSFileData {
  name: string;
  hash: string;
  url: string;
}

export interface IPFSMetadata extends ProjectFormData {
  files: IPFSFileData[];
  timestamp: string;
}

export interface UploadProjectDataResult {
  metadataHash: string;
  metadata: IPFSMetadata;
}

export interface MilestoneProofData {
  files: IPFSFileData[];
  timestamp: string;
  [key: string]: unknown;
}

export interface UploadMilestoneProofResult {
  proofHash: string;
  proofData: MilestoneProofData;
}

// Self Protocol types
export interface VerificationResult {
  success: boolean;
  verified: boolean;
  address: string;
  timestamp: number;
  message: string;
}

// Leaderboard types
export interface LeaderboardDonor {
  address: string;
  totalDonated: string;
  aidTokens: string;
  rank: number;
}

// Dynamic Labs types
export interface DynamicUser {
  email?: string;
  verifiedCredentials?: Array<{
    address: string;
  }>;
}

export interface DynamicContextType {
  user: DynamicUser | null;
  setShowAuthFlow: (show: boolean) => void;
  handleLogOut: () => void;
}

// Vite env types
interface ImportMetaEnv {
  readonly VITE_AIDCHAIN_ADDRESS: string;
  readonly VITE_AIDTOKEN_ADDRESS: string;
  readonly VITE_DYNAMIC_ENV_ID: string;
  readonly VITE_IPFS_GATEWAY: string;
  readonly VITE_BACKEND_API: string;
  readonly VITE_SELF_PROTOCOL_API: string;
  readonly VITE_SELF_PROTOCOL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
