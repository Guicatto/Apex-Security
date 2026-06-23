import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import PullRequests from './pages/PullRequests'
import Remediations from './pages/Remediations'
import Repositories from './pages/Repositories'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/pull-requests" element={<PullRequests />} />
        <Route path="/remediations" element={<Remediations />} />
        <Route path="/repositories" element={<Repositories />} />
      </Routes>
    </Layout>
  )
}
