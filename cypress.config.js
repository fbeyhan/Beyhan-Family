module.exports = {
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    excludeSpecPattern: [
      'cypress/e2e/finance*.cy.ts'
    ]
  }
}
