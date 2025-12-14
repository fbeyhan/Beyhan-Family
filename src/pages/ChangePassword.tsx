import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../config/firebase'

export const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      setLoading(false)
      return
    }

    try {
      // Re-authenticate user before changing password
      if (!auth.currentUser || !user?.email) {
        throw new Error('User not authenticated')
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, newPassword)

      setMessage('Password changed successfully! 🎉')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password')
      } else {
        setError('Failed to change password. Please try again.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold mb-3 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔒</span>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600" style={{fontFamily: 'Poppins, sans-serif'}}>
              Change Password
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100 p-10">
          <p className="text-gray-600 mb-8 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
            Update your password to keep your account secure
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                🔑 Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                placeholder="Enter your current password"
                autoComplete="current-password"
                style={{fontFamily: 'Poppins, sans-serif'}}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                🔐 New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                placeholder="Enter your new password (min 6 characters)"
                autoComplete="new-password"
                style={{fontFamily: 'Poppins, sans-serif'}}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                ✅ Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                style={{fontFamily: 'Poppins, sans-serif'}}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
                ⚠️ {error}
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
                ✅ {message}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                {loading ? '🔄 Updating...' : '💾 Update Password'}
              </button>
              <Link
                to="/dashboard"
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-center"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                ❌ Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
