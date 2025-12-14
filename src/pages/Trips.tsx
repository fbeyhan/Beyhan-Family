import React from 'react'
import { Link } from 'react-router-dom'

export const Trips: React.FC = () => {
  const trips = [
    { title: 'Summer Vacation 2023', location: 'Turkey', emoji: '🇹🇷' },
    { title: 'Winter Holidays 2024', location: 'Alps', emoji: '⛷️' },
    { title: 'Beach Getaway', location: 'Mediterranean', emoji: '🏖️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold mb-3 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">✈️</span>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600" style={{fontFamily: 'Poppins, sans-serif'}}>
              Family Trips
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {trips.map((trip, index) => (
            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-amber-100 hover:border-amber-300 p-8 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>{trip.title}</h3>
                  <p className="text-gray-600 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>📍 {trip.location}</p>
                </div>
                <span className="text-5xl transition-transform duration-300 hover:scale-110">{trip.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
