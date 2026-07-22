import { Navigate } from 'react-router-dom'

/**
 * Envolve as rotas do painel: sem token no localStorage, manda para /login.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}
