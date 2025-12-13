import React from 'react'
import { Link } from 'react-router-dom'

export const FamilyTree: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 font-semibold mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Family Tree</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 text-lg mb-8">
            🌳 Family genealogy and connections will be displayed here.
          </p>

          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="inline-block bg-blue-100 rounded-lg p-4 mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <p className="mt-2 font-semibold">Beyhan Family</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {['Member 1', 'Member 2', 'Member 3'].map((member, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 text-center">
                <span className="text-3xl block mb-2">👤</span>
                <p className="font-semibold text-gray-700">{member}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
