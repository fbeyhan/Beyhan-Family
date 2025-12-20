import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // Debug: log user and isAuthenticated for troubleshooting
  // eslint-disable-next-line no-console
  console.log('ProtectedRoute user:', user, 'isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
