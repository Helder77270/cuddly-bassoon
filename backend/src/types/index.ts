/**
 * Type definitions for AidChain Backend
 */

// ElizaOS types
export interface ParsedTweetData {
  name: string;
  description: string;
  fundingGoal: string;
  location: string;
  category: string;
  source: string;
  parsedAt: string;
}

export interface ParseTweetResult {
  success: boolean;
  data: ParsedTweetData;
}

export interface ProjectData {
  name: string;
  description: string;
  fundingGoal: string;
  metadata: {
    location: string;
    category: string;
    source?: string;
    autoCreated: boolean;
    createdAt: string;
  };
}

export interface CreateProjectResult {
  success: boolean;
  project: ProjectData;
  message: string;
}

export interface AnalysisResult {
  success: boolean;
  analysis?: string;
  error?: string;
}

export interface RecommendationsResult {
  success: boolean;
  recommendations?: string;
  error?: string;
}

// Twitter types
export interface Tweet {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

export interface DonationHistory {
  projectId: string;
  amount: string;
  category?: string;
}

// IPFS types
export interface IPFSUploadResult {
  hash: string;
}

// API response types
export interface HealthCheckResponse {
  status: string;
  service: string;
}

export interface ErrorResponse {
  error: string;
}
