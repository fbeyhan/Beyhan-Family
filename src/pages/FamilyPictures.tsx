import React from 'react'
import { Link } from 'react-router-dom'

export const FamilyPictures: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 font-semibold mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Family Pictures</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 text-lg mb-4">
            📸 This is the Family Pictures page. Coming soon: Photo gallery, albums, and shared memories!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-48 flex items-center justify-center text-gray-500"
              >
                Photo {i}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
