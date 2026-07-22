import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import PullRequests from './pages/PullRequests'
import Remediations from './pages/Remediations'
import Repositories from './pages/Repositories'
import RealRisk from './pages/RealRisk'
import AnomalyAnalysis from './pages/AnomalyAnalysis'
import IntentChecker from './pages/IntentChecker'
import Radar from './pages/Radar'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <Routes>
      {/* Rotas publicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Painel — exige sessao ativa */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/pull-requests" element={<PullRequests />} />
                <Route path="/remediations" element={<Remediations />} />
                <Route path="/real-risk" element={<RealRisk />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/anomaly-analysis" element={<AnomalyAnalysis />} />
                <Route path="/intent-checker" element={<IntentChecker />} />
                <Route path="/radar" element={<Radar />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
