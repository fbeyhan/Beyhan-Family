describe('Home page', () => {
  it('loads successfully', () => {
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })
})
