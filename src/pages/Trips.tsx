import React from 'react'
import { Link } from 'react-router-dom'

export const Trips: React.FC = () => {
  const trips = [
    { title: 'Summer Vacation 2023', location: 'Turkey', emoji: '🇹🇷' },
    { title: 'Winter Holidays 2024', location: 'Alps', emoji: '⛷️' },
    { title: 'Beach Getaway', location: 'Mediterranean', emoji: '🏖️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 font-semibold mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Family Trips</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {trips.map((trip, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{trip.title}</h3>
                  <p className="text-gray-600">{trip.location}</p>
                </div>
                <span className="text-4xl">{trip.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
