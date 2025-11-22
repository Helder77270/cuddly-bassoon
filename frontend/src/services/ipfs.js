import { create } from 'ipfs-http-client'
import axios from 'axios'

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'

class IPFSService {
  constructor() {
    // Initialize IPFS client (can use Infura, Pinata, or local node)
    this.client = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: `Basic ${btoa(
          `${import.meta.env.VITE_IPFS_PROJECT_ID}:${import.meta.env.VITE_IPFS_PROJECT_SECRET}`
        )}`,
      },
    })
  }

  async uploadFile(file) {
    try {
      const added = await this.client.add(file)
      return added.path // Returns the IPFS hash
    } catch (error) {
      console.error('Error uploading file to IPFS:', error)
      throw error
    }
  }

  async uploadJSON(data) {
    try {
      const jsonString = JSON.stringify(data)
      const added = await this.client.add(jsonString)
      return added.path
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error)
      throw error
    }
  }

  async getFile(hash) {
    try {
      const response = await axios.get(`${IPFS_GATEWAY}${hash}`)
      return response.data
    } catch (error) {
      console.error('Error getting file from IPFS:', error)
      throw error
    }
  }

  getGatewayURL(hash) {
    return `${IPFS_GATEWAY}${hash}`
  }

  async uploadProjectData(projectData, files) {
    try {
      // Upload files first
      const fileHashes = []
      for (const file of files) {
        const hash = await this.uploadFile(file)
        fileHashes.push({
          name: file.name,
          hash: hash,
          url: this.getGatewayURL(hash),
        })
      }

      // Create metadata object
      const metadata = {
        ...projectData,
        files: fileHashes,
        timestamp: new Date().toISOString(),
      }

      // Upload metadata
      const metadataHash = await this.uploadJSON(metadata)
      return {
        metadataHash,
        metadata,
      }
    } catch (error) {
      console.error('Error uploading project data:', error)
      throw error
    }
  }

  async uploadMilestoneProof(milestoneData, files) {
    try {
      const fileHashes = []
      for (const file of files) {
        const hash = await this.uploadFile(file)
        fileHashes.push({
          name: file.name,
          hash: hash,
          url: this.getGatewayURL(hash),
        })
      }

      const proofData = {
        ...milestoneData,
        files: fileHashes,
        timestamp: new Date().toISOString(),
      }

      const proofHash = await this.uploadJSON(proofData)
      return {
        proofHash,
        proofData,
      }
    } catch (error) {
      console.error('Error uploading milestone proof:', error)
      throw error
    }
  }
}

export default new IPFSService()
