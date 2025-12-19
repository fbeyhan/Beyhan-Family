import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../config/firebase'
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const { login, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    const success = await login(email, password)
    
    if (success) {
      // Check if email is verified
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        // Auto-send verification email
        try {
          await sendEmailVerification(auth.currentUser)
          setMessage('Verification email sent! Please check your inbox and click the link to verify your email.')
          setNeedsVerification(true)
        } catch (err) {
          setError('Failed to send verification email. Please try again.')
        }
        await logout()
        setLoading(false)
        return
      }
      navigate('/dashboard')
    } else {
      setError('Invalid email or password. Please try again.')
    }
    
    setLoading(false)
  }

  const handleResendVerification = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    // Re-login to get current user
    const success = await login(email, password)
    
    if (success && auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser)
        setMessage('Verification email resent! Please check your inbox.')
        await logout()
      } catch (err: any) {
        if (err.code === 'auth/too-many-requests') {
          setError('Too many requests. Please wait a few minutes before trying again.')
        } else {
          setError('Failed to send verification email. Please try again.')
        }
      }
    }
    
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!resetEmail.trim()) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setMessage('Password reset email sent! Check your inbox and follow the link to reset your password.')
      setResetEmail('')
      setTimeout(() => {
        setShowForgotPassword(false)
      }, 3000)
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 flex items-center justify-center px-4 py-12">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md p-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Beyhan Family</h1>
          <p className="text-gray-600 text-sm font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
            {showForgotPassword ? 'Reset Your Password' : 'Welcome to Our Family Portal'}
          </p>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
              📧 Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
              placeholder="your.email@example.com"
              autoComplete="email"
              style={{fontFamily: 'Poppins, sans-serif'}}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                🔒 Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true)
                  setError('')
                  setMessage('')
                }}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
              placeholder="Enter your password"
              autoComplete="current-password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            style={{fontFamily: 'Poppins, sans-serif'}}
          >
            {loading ? '🔄 Signing in...' : '🚀 Sign In'}
          </button>

            {needsVerification && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                📧 Resend Verification Email
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-semibold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                📧 Email Address
              </label>
              <input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                placeholder="your.email@example.com"
                autoComplete="email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{fontFamily: 'Poppins, sans-serif'}}
            >
              {loading ? '🔄 Sending...' : '📧 Send Reset Email'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
                setResetEmail('')
                setError('')
                setMessage('')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300"
              style={{fontFamily: 'Poppins, sans-serif'}}
            >
              ← Back to Login
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-xs font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
            🔐 Secure Family Access • Members Only
          </p>
        </div>
      </div>
    </div>
  )
}
