import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { CheckCircle, AlertCircle, Calendar, Target, Heart, TrendingUp } from 'lucide-react';
import blockchainService from '../services/blockchain';
import ipfsService from '../services/ipfs';
import toast from 'react-hot-toast';
import { Project, Milestone, IPFSMetadata, DynamicUser } from '../types';

interface DynamicContext {
  user: DynamicUser | null;
}

export default function ProjectDetails(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { user } = useDynamicContext() as DynamicContext;
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [projectMetadata, setProjectMetadata] = useState<IPFSMetadata | null>(null);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  async function loadProjectDetails(): Promise<void> {
    if (!id) return;
    
    try {
      setLoading(true);
      const projectData = await blockchainService.getProject(id);
      setProject(projectData);

      // Load IPFS metadata
      if (projectData.ipfsHash) {
        try {
          const metadata = await ipfsService.getFile<IPFSMetadata>(projectData.ipfsHash);
          setProjectMetadata(metadata);
        } catch (error) {
          console.error('Error loading IPFS metadata:', error);
        }
      }

      // Load milestones
      const milestoneIds = await blockchainService.getProjectMilestones(id);
      const milestonesData = await Promise.all(
        milestoneIds.map(mId => blockchainService.getMilestone(mId))
      );
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }

  async function handleDonate(): Promise<void> {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!id) return;

    try {
      await blockchainService.fundProject(id, donationAmount);
      toast.success('Donation successful! Thank you for your support!');
      setDonationAmount('');
      loadProjectDetails();
    } catch (error) {
      console.error('Error donating:', error);
      toast.error('Failed to process donation');
    }
  }

  async function handleVote(milestoneId: string, approve: boolean): Promise<void> {
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await blockchainService.voteOnMilestone(milestoneId, approve);
      toast.success('Vote recorded successfully!');
      loadProjectDetails();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-400 mt-4">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Project not found</p>
      </div>
    );
  }

  const progress = (parseFloat(project.fundsRaised) / parseFloat(project.fundingGoal)) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{project.name}</h1>
            <p className="text-gray-400 text-lg">{project.description}</p>
          </div>
          {project.zkKYCVerified ? (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-900/30 border border-green-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400 font-semibold">Verified</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-900/30 border border-yellow-700">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-400 font-semibold">Unverified</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-2">
              <Target className="w-5 h-5 mr-2" />
              <span>Funding Goal</span>
            </div>
            <p className="text-2xl font-bold text-white">{project.fundingGoal} ETH</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-2">
              <Heart className="w-5 h-5 mr-2" />
              <span>Raised</span>
            </div>
            <p className="text-2xl font-bold text-white">{project.fundsRaised} ETH</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-2">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span>Reputation</span>
            </div>
            <p className="text-2xl font-bold text-white">{project.reputationScore}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Created on {new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
            {milestones.length === 0 ? (
              <p className="text-gray-400">No milestones created yet</p>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{milestone.description}</h3>
                        <p className="text-gray-400">Funding: {milestone.fundingAmount} ETH</p>
                      </div>
                      {milestone.approved ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : milestone.completed ? (
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                      ) : null}
                    </div>

                    {milestone.completed && !milestone.approved && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Votes For: {milestone.votesFor} ETH</span>
                          <span className="text-gray-400">Votes Against: {milestone.votesAgainst} ETH</span>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleVote(milestone.id, true)}
                            className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVote(milestone.id, false)}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {projectMetadata && projectMetadata.files && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Project Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectMetadata.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900 transition border border-gray-700"
                  >
                    <p className="text-white truncate">{file.name}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 sticky top-4">
            <h3 className="text-xl font-bold text-white mb-4">Support This Project</h3>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Donation Amount (ETH)</label>
              <input
                type="number"
                value={donationAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDonationAmount(e.target.value)}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                placeholder="0.1"
              />
            </div>
            <button
              onClick={handleDonate}
              disabled={!project.active || !project.zkKYCVerified}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Donate Now
            </button>
            {!project.zkKYCVerified && (
              <p className="text-yellow-400 text-sm mt-2">
                This project is not yet verified
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
