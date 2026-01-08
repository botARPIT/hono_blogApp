import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../config'

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

  // Check authentication status on mount by calling backend
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${BACKEND_URL}/api/v1/user/profile_info`, {
        withCredentials: true
      })
      
      // API returns { userProfile: { id, name, email, ... } }
      const userProfile = response.data?.userProfile
      if (userProfile && userProfile.name) {
        setUserName(userProfile.name)
        setUser(userProfile)
      }
    } catch {
      // Not authenticated, clear state
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [setUserName])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Sync with localStorage if it changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userName' && e.newValue) {
        setUserNameState(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setUserNameState('Anonymous')
    localStorage.removeItem('userName')
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user || (!!userName && userName !== 'Anonymous'),
    isLoading,
    userName,
    setUser,
    setUserName,
    logout,
    checkAuth
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
