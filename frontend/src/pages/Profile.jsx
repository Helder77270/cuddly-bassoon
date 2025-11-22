import { useState, useEffect } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react'
import { Wallet, Heart, Trophy, Award } from 'lucide-react'
import blockchainService from '../services/blockchain'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useDynamicContext()
  const [donationHistory, setDonationHistory] = useState([])
  const [reputation, setReputation] = useState('0')
  const [aidBalance, setAidBalance] = useState('0')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.verifiedCredentials?.[0]?.address) {
      loadUserProfile()
    }
  }, [user])

  async function loadUserProfile() {
    try {
      setLoading(true)
      const address = user.verifiedCredentials[0].address

      // Load donation history
      const history = await blockchainService.getDonorHistory(address)
      setDonationHistory(history)

      // Load reputation
      const rep = await blockchainService.getDonorReputation(address)
      setReputation(rep)

      // Load AID token balance
      const balance = await blockchainService.getAIDBalance(address)
      setAidBalance(balance)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to view your profile</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-400 mt-4">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Your Profile</h1>
        <p className="text-gray-400 text-lg">Track your impact and contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center text-gray-400 mb-2">
            <Heart className="w-5 h-5 mr-2" />
            <span>Total Donated</span>
          </div>
          <p className="text-3xl font-bold text-white">{reputation} ETH</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center text-gray-400 mb-2">
            <Award className="w-5 h-5 mr-2" />
            <span>AID Tokens</span>
          </div>
          <p className="text-3xl font-bold text-primary-400">{parseFloat(aidBalance).toFixed(2)}</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center text-gray-400 mb-2">
            <Trophy className="w-5 h-5 mr-2" />
            <span>Projects Supported</span>
          </div>
          <p className="text-3xl font-bold text-white">{donationHistory.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Address</p>
            <p className="text-white font-mono">{user.verifiedCredentials[0].address}</p>
          </div>
          {user.email && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Donation History</h2>
        {donationHistory.length === 0 ? (
          <p className="text-gray-400">No donations yet. Start supporting projects to build your impact!</p>
        ) : (
          <div className="space-y-4">
            {donationHistory.map((donation, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold mb-1">
                      Project #{donation.projectId}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(donation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-bold text-lg">{donation.amount} ETH</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
