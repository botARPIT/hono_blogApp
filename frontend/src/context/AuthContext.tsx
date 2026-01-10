import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  userName: string
  setUser: (user: User | null) => void
  setUserName: (name: string) => void
  logout: () => void
  checkAuth: () => Promise<void>
  clearSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserNameState] = useState(() => localStorage.getItem('userName') || 'Anonymous')

  const setUserName = useCallback((name: string) => {
    setUserNameState(name)
    localStorage.setItem('userName', name)
  }, [])

  /**
   * Clear session state completely - used when tokens are invalid/expired
   * This ensures the user is properly logged out even if backend call fails
   */
  const clearSession = useCallback(() => {
    setUser(null)
    setUserNameState('Anonymous')
    localStorage.removeItem('userName')
    // Also try to clear any isAuthenticated indicator
    localStorage.removeItem('isAuthenticated')
  }, [])

  /**
   * Logout function that calls backend and clears local state
   * If backend call fails (e.g., due to expired tokens), still clear local state
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } catch {
      // Even if backend logout fails, we should still clear local state
      // This handles the case where tokens are already expired
      console.warn('Backend logout failed, clearing local session anyway')
    }
    // Always clear session regardless of backend response
    clearSession()
  }, [clearSession])

  /**
   * Check authentication status by calling backend
   * If the call fails with 401, the axios interceptor will try to refresh
   * If refresh also fails, session will be cleared via the sessionExpired event
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/v1/user/profile_info')
      
      // API returns { userProfile: { id, name, email, ... } }
      const userProfile = response.data?.userProfile
      if (userProfile && userProfile.name) {
        setUserName(userProfile.name)
        setUser(userProfile)
        localStorage.setItem('isAuthenticated', 'true')
      } else {
        clearSession()
      }
    } catch {
      // Not authenticated or session expired, clear state
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [setUserName, clearSession])

  // Listen for session expired events from axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession()
    }

    window.addEventListener('auth:sessionExpired', handleSessionExpired)
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired)
    }
  }, [clearSession])

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Sync with localStorage if it changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userName' && e.newValue) {
        setUserNameState(e.newValue)
      }
      if (e.key === 'isAuthenticated' && e.newValue === null) {
        // User logged out in another tab
        clearSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [clearSession])

  // isAuthenticated is now based on actual user object, not localStorage
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    userName: user?.name || userName,
    setUser,
    setUserName,
    logout,
    checkAuth,
    clearSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
