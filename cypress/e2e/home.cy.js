describe('Family Portal', () => {
  it('displays login page on initial visit', () => {
    cy.visit('/')
    cy.contains('Beyhan Family').should('exist')
    cy.get('input[placeholder="Enter username"]').should('exist')
    cy.get('input[placeholder="Enter password"]').should('exist')
  })

  it('shows error on invalid credentials', () => {
    cy.visit('/')
    cy.get('input[placeholder="Enter username"]').type('wronguser')
    cy.get('input[placeholder="Enter password"]').type('wrongpass')
    cy.contains('button', 'Login').click()
    cy.contains('Invalid username or password').should('exist')
  })

  it('logs in with valid credentials and navigates to dashboard', () => {
    cy.visit('/')
    cy.get('input[placeholder="Enter username"]').type('beyhan')
    cy.get('input[placeholder="Enter password"]').type('family123')
    cy.contains('button', 'Login').click()
    cy.contains('Family Portal').should('exist')
    cy.contains('Family Pictures').should('exist')
    cy.contains('Trips').should('exist')
    cy.contains('Family Tree').should('exist')
  })

  it('navigates to Family Pictures page', () => {
    cy.visit('/')
    cy.get('input[placeholder="Enter username"]').type('beyhan')
    cy.get('input[placeholder="Enter password"]').type('family123')
    cy.contains('button', 'Login').click()
    cy.contains('Family Pictures').click()
    cy.contains('Family Pictures').should('exist')
    cy.contains('Photo gallery').should('exist')
  })

  it('logs out and redirects to login', () => {
    cy.visit('/')
    cy.get('input[placeholder="Enter username"]').type('beyhan')
    cy.get('input[placeholder="Enter password"]').type('family123')
    cy.contains('button', 'Login').click()
    cy.contains('button', 'Logout').click()
    cy.get('input[placeholder="Enter username"]').should('exist')
  })
})
