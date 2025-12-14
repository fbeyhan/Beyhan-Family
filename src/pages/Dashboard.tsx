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
    className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition duration-200"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Beyhan Family</h1>
            <p className="text-gray-600">Welcome, {user?.email}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Family Portal</h2>
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
