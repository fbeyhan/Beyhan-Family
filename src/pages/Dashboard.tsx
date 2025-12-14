import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface MenuItemProps {
  title: string
  description: string
  icon: string
  link: string
}

const MenuItem: React.FC<MenuItemProps> = ({ title, description, icon, link }) => (
  <Link
    to={link}
    className="group p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-amber-100 hover:border-amber-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
  >
    <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>{title}</h3>
    <p className="text-gray-600 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>{description}</p>
  </Link>
)

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">🏠</span>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600" style={{fontFamily: 'Poppins, sans-serif'}}>
                Beyhan Family
              </h1>
            </div>
            <p className="text-gray-600 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>Welcome back, {user?.email?.split('@')[0]}! 🎉</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/change-password"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              style={{fontFamily: 'Poppins, sans-serif'}}
            >
              🔒 Change Password
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              style={{fontFamily: 'Poppins, sans-serif'}}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-3" style={{fontFamily: 'Poppins, sans-serif'}}>✨ Family Portal</h2>
        <p className="text-gray-600 mb-10 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>Choose where you'd like to explore</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MenuItem
            title="Family Pictures"
            description="View and browse our family photo collection"
            icon="📸"
            link="/family-pictures"
          />
          <MenuItem
            title="Trips"
            description="Explore memorable family trips and vacations"
            icon="✈️"
            link="/trips"
          />
          <MenuItem
            title="Family Tree"
            description="Discover our family genealogy and connections"
            icon="🌳"
            link="/family-tree"
          />
        </div>
      </main>
    </div>
  )
}
