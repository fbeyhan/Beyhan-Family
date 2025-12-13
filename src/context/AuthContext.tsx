import React, { createContext, useState, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  // Simple credentials for demo purposes
  // In production, this would call a backend API
  const login = (inputUsername: string, inputPassword: string) => {
    // Simple hardcoded credentials for demo
    if (inputUsername === 'beyhan' && inputPassword === 'family123') {
      setIsAuthenticated(true)
      setUsername(inputUsername)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
