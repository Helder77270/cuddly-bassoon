import axios from 'axios';
import { VerificationResult } from '../types';

const SELF_PROTOCOL_API = import.meta.env.VITE_SELF_PROTOCOL_API || 'https://api.selfprotocol.io';

interface UserInfo {
  [key: string]: unknown;
}

interface Proof {
  [key: string]: unknown;
}

interface InitiateVerificationResponse {
  sessionId: string;
  status: string;
}

interface VerifyProofResponse {
  verified: boolean;
  status: string;
}

interface VerificationStatusResponse {
  verified: boolean;
  status: string;
  timestamp?: number;
}

interface GeneratedProof {
  verified: boolean;
  timestamp: number;
  proofHash: string;
}

class SelfProtocolService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_SELF_PROTOCOL_API_KEY || '';
  }

  /**
   * Initiate zkKYC verification process
   */
  async initiateVerification(address: string, userInfo: UserInfo): Promise<InitiateVerificationResponse> {
    try {
      const response = await axios.post<InitiateVerificationResponse>(
        `${SELF_PROTOCOL_API}/kyc/initiate`,
        {
          address,
          userInfo,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error initiating zkKYC verification:', error);
      throw error;
    }
  }

  /**
   * Submit zkKYC proof for verification
   */
  async submitProof(address: string, proof: Proof): Promise<VerifyProofResponse> {
    try {
      const response = await axios.post<VerifyProofResponse>(
        `${SELF_PROTOCOL_API}/kyc/verify`,
        {
          address,
          proof,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting zkKYC proof:', error);
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(address: string): Promise<VerificationStatusResponse> {
    try {
      const response = await axios.get<VerificationStatusResponse>(
        `${SELF_PROTOCOL_API}/kyc/status/${address}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw error;
    }
  }

  /**
   * Generate zkKYC proof (simplified version)
   * In production, this would use Self Protocol's SDK
   */
  async generateProof(_userData: UserInfo): Promise<GeneratedProof> {
    try {
      // In production, this would involve:
      // 1. User provides personal information
      // 2. Information is verified off-chain
      // 3. Zero-knowledge proof is generated using cryptographic methods
      // 4. Proof is submitted on-chain for verification
      
      // Note: This is a simplified mock. In production, use proper
      // cryptographic libraries and Self Protocol's SDK
      const proof: GeneratedProof = {
        verified: true,
        timestamp: Date.now(),
        // In production, this would be a cryptographic proof, not encoded data
        proofHash: `proof_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
      
      return proof;
    } catch (error) {
      console.error('Error generating proof:', error);
      throw error;
    }
  }

  /**
   * Mock verification for development
   */
  async mockVerification(address: string): Promise<VerificationResult> {
    // For development/testing purposes only
    return {
      success: true,
      verified: true,
      address,
      timestamp: Date.now(),
      message: 'Mock verification successful',
    };
  }
}

export default new SelfProtocolService();
