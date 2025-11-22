import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CreateProject from './pages/CreateProject'
import ProjectDetails from './pages/ProjectDetails'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID || 'your-dynamic-env-id',
        walletConnectors: ['metamask', 'walletconnect'],
      }}
    >
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateProject />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </DynamicContextProvider>
  )
}

export default App
