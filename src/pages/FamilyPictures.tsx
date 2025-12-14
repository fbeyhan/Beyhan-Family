import React from 'react'
import { Link } from 'react-router-dom'

export const FamilyPictures: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold mb-3 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">📸</span>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600" style={{fontFamily: 'Poppins, sans-serif'}}>
              Family Pictures
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100 p-10">
          <p className="text-gray-600 text-lg mb-4 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
            ✨ Photo gallery, albums, and shared memories coming soon!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-amber-100 to-rose-100 rounded-2xl h-56 flex items-center justify-center text-gray-600 font-semibold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-200"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                🖼️ Photo {i}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
