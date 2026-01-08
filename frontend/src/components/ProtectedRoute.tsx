import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component that redirects unauthenticated users to signin page
 * Preserves the intended destination for redirect after login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading while checking auth status
  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    // Redirect to signin but save the location they were trying to access
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return <>{children}</>
}
