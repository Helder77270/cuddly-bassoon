import axios from 'axios';
import {
  IPFSFileData,
  UploadProjectDataResult,
  UploadMilestoneProofResult,
  ProjectFormData
} from '../types';

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
const BACKEND_API = import.meta.env.VITE_BACKEND_API || 'http://localhost:3001';

class IPFSService {
  /**
   * Upload file via backend to keep IPFS credentials secure
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post<{ hash: string }>(`${BACKEND_API}/api/ipfs/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.hash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(data: unknown): Promise<string> {
    try {
      const response = await axios.post<{ hash: string }>(`${BACKEND_API}/api/ipfs/upload-json`, {
        data
      });
      
      return response.data.hash;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }

  async getFile<T = unknown>(hash: string): Promise<T> {
    try {
      const response = await axios.get<unknown>(`${IPFS_GATEWAY}${hash}`);
      
      // Basic validation - ensure we got a response
      if (response.data === null || response.data === undefined) {
        throw new Error('IPFS returned empty content');
      }
      
      return response.data as T;
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw error;
    }
  }

  getGatewayURL(hash: string): string {
    return `${IPFS_GATEWAY}${hash}`;
  }

  async uploadProjectData(projectData: ProjectFormData, files: File[]): Promise<UploadProjectDataResult> {
    try {
      // Upload files first
      const fileHashes: IPFSFileData[] = [];
      for (const file of files) {
        const hash = await this.uploadFile(file);
        fileHashes.push({
          name: file.name,
          hash: hash,
          url: this.getGatewayURL(hash),
        });
      }

      // Create metadata object
      const metadata = {
        ...projectData,
        files: fileHashes,
        timestamp: new Date().toISOString(),
      };

      // Upload metadata
      const metadataHash = await this.uploadJSON(metadata);
      return {
        metadataHash,
        metadata,
      };
    } catch (error) {
      console.error('Error uploading project data:', error);
      throw error;
    }
  }

  async uploadMilestoneProof(
    milestoneData: Record<string, unknown>,
    files: File[]
  ): Promise<UploadMilestoneProofResult> {
    try {
      const fileHashes: IPFSFileData[] = [];
      for (const file of files) {
        const hash = await this.uploadFile(file);
        fileHashes.push({
          name: file.name,
          hash: hash,
          url: this.getGatewayURL(hash),
        });
      }

      const proofData = {
        ...milestoneData,
        files: fileHashes,
        timestamp: new Date().toISOString(),
      };

      const proofHash = await this.uploadJSON(proofData);
      return {
        proofHash,
        proofData,
      };
    } catch (error) {
      console.error('Error uploading milestone proof:', error);
      throw error;
    }
  }
}

export default new IPFSService();
