import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import blockchainService from '../services/blockchain';
import toast from 'react-hot-toast';
import { Project, LeaderboardDonor } from '../types';

export default function Leaderboard(): JSX.Element {
  const [donors, setDonors] = useState<LeaderboardDonor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'donors' | 'projects'>('donors');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard(): Promise<void> {
    try {
      setLoading(true);
      
      // Load all projects and calculate their reputation
      const projectCount = await blockchainService.getProjectCount();
      const projectsData: Project[] = [];

      for (let i = 1; i <= projectCount; i++) {
        try {
          const project = await blockchainService.getProject(i);
          projectsData.push(project);
        } catch (error) {
          console.error(`Error loading project ${i}:`, error);
        }
      }

      // Sort projects by reputation score
      const sortedProjects = projectsData
        .sort((a, b) => parseInt(b.reputationScore) - parseInt(a.reputationScore))
        .slice(0, 10);

      setProjects(sortedProjects);

      // For donors, we would need to track unique donors
      // This is a simplified version
      const mockDonors: LeaderboardDonor[] = [
        { address: '0x1234...5678', totalDonated: '5.5', aidTokens: '5500', rank: 1 },
        { address: '0x8765...4321', totalDonated: '3.2', aidTokens: '3200', rank: 2 },
        { address: '0xabcd...efgh', totalDonated: '2.1', aidTokens: '2100', rank: 3 },
      ];
      setDonors(mockDonors);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rank: number): JSX.Element => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-gray-400 font-bold">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-400 mt-4">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Impact Leaderboard</h1>
        <p className="text-gray-400 text-lg">
          Recognize top donors and most impactful humanitarian projects
        </p>
      </div>

      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => setActiveTab('donors')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'donors'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Top Donors
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'projects'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Top Projects
        </button>
      </div>

      {activeTab === 'donors' ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Address</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Total Donated</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">AID Tokens</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor, index) => (
                  <tr key={donor.address} className="border-t border-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-mono">{donor.address}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{donor.totalDonated} ETH</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-primary-400 font-semibold">{donor.aidTokens} AID</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 flex items-center"
            >
              <div className="flex items-center justify-center w-16 mr-6">
                {getRankIcon(index + 1)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
              </div>
              <div className="text-right ml-6">
                <p className="text-gray-400 text-sm">Reputation Score</p>
                <p className="text-3xl font-bold text-primary-400">{project.reputationScore}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
