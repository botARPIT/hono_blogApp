import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  userName: string
  setUser: (user: User | null) => void
  setUserName: (name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserNameState] = useState(() => localStorage.getItem('userName') || 'Anonymous')

  const setUserName = useCallback((name: string) => {
    setUserNameState(name)
    localStorage.setItem('userName', name)
  }, [])

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
    userName,
    setUser,
    setUserName,
    logout
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
