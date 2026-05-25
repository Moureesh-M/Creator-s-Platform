import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner message="Loading..." />

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute
