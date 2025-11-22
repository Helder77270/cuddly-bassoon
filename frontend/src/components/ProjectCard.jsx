import { Link } from 'react-router-dom'
import { Target, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProjectCard({ project }) {
  const progress = (parseFloat(project.fundsRaised) / parseFloat(project.fundingGoal)) * 100

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-primary-500 transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
          </div>
          {project.zkKYCVerified ? (
            <CheckCircle className="w-6 h-6 text-green-500 ml-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-500 ml-2 flex-shrink-0" />
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-semibold">
              {project.fundsRaised} / {project.fundingGoal} ETH
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            <span>Score: {project.reputationScore}</span>
          </div>
        </div>

        <Link
          to={`/project/${project.id}`}
          className="block w-full text-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
