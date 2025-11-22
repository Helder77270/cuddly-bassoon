import axios from 'axios'

const SELF_PROTOCOL_API = import.meta.env.VITE_SELF_PROTOCOL_API || 'https://api.selfprotocol.io'

class SelfProtocolService {
  constructor() {
    this.apiKey = import.meta.env.VITE_SELF_PROTOCOL_API_KEY
  }

  /**
   * Initiate zkKYC verification process
   */
  async initiateVerification(address, userInfo) {
    try {
      const response = await axios.post(
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
      )
      return response.data
    } catch (error) {
      console.error('Error initiating zkKYC verification:', error)
      throw error
    }
  }

  /**
   * Submit zkKYC proof for verification
   */
  async submitProof(address, proof) {
    try {
      const response = await axios.post(
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
      )
      return response.data
    } catch (error) {
      console.error('Error submitting zkKYC proof:', error)
      throw error
    }
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(address) {
    try {
      const response = await axios.get(
        `${SELF_PROTOCOL_API}/kyc/status/${address}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error checking verification status:', error)
      throw error
    }
  }

  /**
   * Generate zkKYC proof (simplified version)
   * In production, this would use Self Protocol's SDK
   */
  async generateProof(userData) {
    try {
      // Simulate proof generation
      // In production, this would involve:
      // 1. User provides personal information
      // 2. Information is verified off-chain
      // 3. Zero-knowledge proof is generated
      // 4. Proof is submitted on-chain for verification
      
      const proof = {
        verified: true,
        timestamp: Date.now(),
        proofData: btoa(JSON.stringify(userData)),
      }
      
      return proof
    } catch (error) {
      console.error('Error generating proof:', error)
      throw error
    }
  }

  /**
   * Mock verification for development
   */
  async mockVerification(address) {
    // For development/testing purposes only
    return {
      success: true,
      verified: true,
      address,
      timestamp: Date.now(),
      message: 'Mock verification successful',
    }
  }
}

export default new SelfProtocolService()
