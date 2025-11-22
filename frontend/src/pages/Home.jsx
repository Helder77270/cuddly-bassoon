import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import blockchainService from '../services/blockchain'
import toast from 'react-hot-toast'

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVerified, setFilterVerified] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const count = await blockchainService.getProjectCount()
      const projectsData = []

      for (let i = 1; i <= count; i++) {
        try {
          const project = await blockchainService.getProject(i)
          projectsData.push(project)
        } catch (error) {
          console.error(`Error loading project ${i}:`, error)
        }
      }

      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterVerified || project.zkKYCVerified
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Humanitarian Projects on AidChain
        </h1>
        <p className="text-gray-400 text-lg">
          Support verified humanitarian projects with transparent, milestone-based funding
        </p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => setFilterVerified(!filterVerified)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition ${
            filterVerified
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Verified Only</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
