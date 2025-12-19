import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { FamilyPictures } from './pages/FamilyPictures'
import { Trips } from './pages/Trips'
import { FamilyTree } from './pages/FamilyTree'
import { ChangePassword } from './pages/ChangePassword'
import Finance from './pages/Finance'
import FinanceAdd from './pages/FinanceAdd'
import FinanceTransactions from './pages/FinanceTransactions'
import FinanceAssets from './pages/FinanceAssets'
import FinanceReports from './pages/FinanceReports'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/family-pictures"
            element={
              <ProtectedRoute>
                <FamilyPictures />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/family-tree"
            element={
              <ProtectedRoute>
                <FamilyTree />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/add"
            element={
              <ProtectedRoute>
                <FinanceAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/transactions"
            element={
              <ProtectedRoute>
                <FinanceTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/assets"
            element={
              <ProtectedRoute>
                <FinanceAssets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/reports"
            element={
              <ProtectedRoute>
                <FinanceReports />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
