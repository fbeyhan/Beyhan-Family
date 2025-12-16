import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { auth } from '../config/firebase'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Monitor authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
        setUser(user)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Auto-logout after 20 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return

    const INACTIVITY_TIMEOUT = 20 * 60 * 1000 // 20 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      // Clear the existing timer
      clearTimeout(inactivityTimer)
      
      // Set a new timer
      inactivityTimer = setTimeout(() => {
        console.log('Auto-logout due to inactivity')
        logout()
      }, INACTIVITY_TIMEOUT)
    }

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Initialize the timer
    resetTimer()

    // Cleanup: remove event listeners and clear timer
    return () => {
      clearTimeout(inactivityTimer)
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [isAuthenticated])

  // Login with Firebase Authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Logout from Firebase Authentication
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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
