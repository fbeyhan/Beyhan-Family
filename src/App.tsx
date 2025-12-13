import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <header className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Beyhan — Test Automation Developer</h1>
        <p className="text-gray-600">Practicing modern web development with React, TypeScript and Cypress.</p>
      </header>

      <main className="max-w-3xl mx-auto mt-8">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Goals</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Learn modern front-end tooling used at work</li>
            <li>Build a personal website to showcase skills</li>
            <li>Practice TypeScript, React and Cypress automation</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
