import { ethers, ContractTransactionReceipt } from 'ethers';
import AidChainABI from '../contracts/AidChain.json';
import AIDTokenABI from '../contracts/AIDToken.json';
import { Project, Milestone, Donation } from '../types';

const AIDCHAIN_ADDRESS = import.meta.env.VITE_AIDCHAIN_ADDRESS;
const AIDTOKEN_ADDRESS = import.meta.env.VITE_AIDTOKEN_ADDRESS;

// Extended window interface for ethereum
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private aidChainContract: ethers.Contract | null = null;
  private aidTokenContract: ethers.Contract | null = null;

  async initialize(): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask!');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    this.aidChainContract = new ethers.Contract(
      AIDCHAIN_ADDRESS,
      AidChainABI,
      this.signer
    );

    this.aidTokenContract = new ethers.Contract(
      AIDTOKEN_ADDRESS,
      AIDTokenABI,
      this.signer
    );
  }

  async createProject(
    name: string,
    description: string,
    ipfsHash: string,
    fundingGoal: string
  ): Promise<ContractTransactionReceipt> {
    if (!this.aidChainContract) await this.initialize();
    
    const tx = await this.aidChainContract!.createProject(
      name,
      description,
      ipfsHash,
      ethers.parseEther(fundingGoal.toString())
    );
    
    const receipt = await tx.wait();
    return receipt;
  }

  async verifyZKKYC(projectId: string | number): Promise<boolean> {
    if (!this.aidChainContract) await this.initialize();
    
    const tx = await this.aidChainContract!.verifyZKKYC(projectId);
    await tx.wait();
    return true;
  }

  async fundProject(projectId: string | number, amount: string): Promise<boolean> {
    if (!this.aidChainContract) await this.initialize();
    
    const tx = await this.aidChainContract!.fundProject(projectId, {
      value: ethers.parseEther(amount.toString())
    });
    
    await tx.wait();
    return true;
  }

  async getProject(projectId: string | number): Promise<Project> {
    if (!this.aidChainContract) await this.initialize();
    
    const project = await this.aidChainContract!.getProject(projectId);
    return {
      id: project.id.toString(),
      creator: project.creator,
      name: project.name,
      description: project.description,
      ipfsHash: project.ipfsHash,
      fundingGoal: ethers.formatEther(project.fundingGoal),
      fundsRaised: ethers.formatEther(project.fundsRaised),
      createdAt: new Date(Number(project.createdAt) * 1000),
      active: project.active,
      zkKYCVerified: project.zkKYCVerified,
      reputationScore: project.reputationScore.toString()
    };
  }

  async getProjectCount(): Promise<number> {
    if (!this.aidChainContract) await this.initialize();
    
    const count = await this.aidChainContract!.projectCount();
    return Number(count);
  }

  async createMilestone(
    projectId: string | number,
    description: string,
    fundingAmount: string,
    votingDuration: number
  ): Promise<boolean> {
    if (!this.aidChainContract) await this.initialize();
    
    const tx = await this.aidChainContract!.createMilestone(
      projectId,
      description,
      ethers.parseEther(fundingAmount.toString()),
      votingDuration
    );
    
    await tx.wait();
    return true;
  }

  async submitMilestoneProof(milestoneId: string | number, proofIPFSHash: string): Promise<boolean> {
    if (!this.aidChainContract) await this.initialize();
    
    const tx = await this.aidChainContract!.submitMilestoneProof(milestoneId, proofIPFSHash);
    await tx.wait();
    return true;
  }

  async voteOnMilestone(milestoneId: string | number, approve: boolean): Promise<boolean> {
    if (!this.aidChainContract) await this.initialize();
    
    const tx = await this.aidChainContract!.voteOnMilestone(milestoneId, approve);
    await tx.wait();
    return true;
  }

  async getProjectMilestones(projectId: string | number): Promise<number[]> {
    if (!this.aidChainContract) await this.initialize();
    
    const milestoneIds = await this.aidChainContract!.getProjectMilestones(projectId);
    return milestoneIds.map((id: bigint) => Number(id));
  }

  async getMilestone(milestoneId: string | number): Promise<Milestone> {
    if (!this.aidChainContract) await this.initialize();
    
    const milestone = await this.aidChainContract!.getMilestone(milestoneId);
    return {
      id: milestone.id.toString(),
      projectId: milestone.projectId.toString(),
      description: milestone.description,
      fundingAmount: ethers.formatEther(milestone.fundingAmount),
      proofIPFSHash: milestone.proofIPFSHash,
      completed: milestone.completed,
      approved: milestone.approved,
      votesFor: ethers.formatEther(milestone.votesFor),
      votesAgainst: ethers.formatEther(milestone.votesAgainst),
      votingDeadline: new Date(Number(milestone.votingDeadline) * 1000)
    };
  }

  async getDonorHistory(address: string): Promise<Donation[]> {
    if (!this.aidChainContract) await this.initialize();
    
    const history = await this.aidChainContract!.getDonorHistory(address);
    return history.map((donation: {
      donor: string;
      amount: bigint;
      timestamp: bigint;
      projectId: bigint;
    }) => ({
      donor: donation.donor,
      amount: ethers.formatEther(donation.amount),
      timestamp: new Date(Number(donation.timestamp) * 1000),
      projectId: donation.projectId.toString()
    }));
  }

  async getDonorReputation(address: string): Promise<string> {
    if (!this.aidChainContract) await this.initialize();
    
    const reputation = await this.aidChainContract!.getDonorReputation(address);
    return ethers.formatEther(reputation);
  }

  async getAIDBalance(address: string): Promise<string> {
    if (!this.aidTokenContract) await this.initialize();
    
    const balance = await this.aidTokenContract!.balanceOf(address);
    return ethers.formatEther(balance);
  }
}

export default new BlockchainService();
