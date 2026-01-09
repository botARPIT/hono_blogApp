import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

interface PublicRouteProps {
  children: React.ReactNode
}

/**
 * PublicRoute component that redirects authenticated users to the blogs page
 * Useful for login and signup pages
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading while checking auth status
  if (isLoading) {
    return <Loading />
  }

  if (isAuthenticated) {
    // Redirect to blogs if already authenticated
    return <Navigate to="/blogs" replace />
  }

  return <>{children}</>
}
