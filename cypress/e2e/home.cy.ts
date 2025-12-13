describe('Home page', () => {
  it('loads and shows headline', () => {
    cy.visit('/')
    cy.contains('Beyhan — Test Automation Developer').should('be.visible')
  })
})
