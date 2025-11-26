import { Link } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { Wallet, Heart, Trophy, User } from 'lucide-react';
import { DynamicUser, DynamicContextType } from '../types';

export default function Navbar(): JSX.Element {
  const { setShowAuthFlow, user, handleLogOut } = useDynamicContext() as DynamicContextType;

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold text-white">AidChain</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition">
              Projects
            </Link>
            <Link to="/create" className="text-gray-300 hover:text-white transition">
              Create Project
            </Link>
            <Link to="/leaderboard" className="text-gray-300 hover:text-white transition flex items-center">
              <Trophy className="w-4 h-4 mr-1" />
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="text-white">{user.email || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogOut}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthFlow(true)}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
