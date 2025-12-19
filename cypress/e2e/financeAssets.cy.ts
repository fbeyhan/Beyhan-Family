import { LoginPage } from '../support/pages/LoginPage';
import { FinanceAssetsPage } from '../support/pages/FinanceAssetsPage';

describe('Finance - Assets Tracking', () => {
  const loginPage = new LoginPage();
  const assetsPage = new FinanceAssetsPage();

  beforeEach(() => {
    // Clear auth state and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    assetsPage.visitAssetsPage();
  });

  it('displays assets page with all elements', () => {
    assetsPage.verifyAssetsPageElements();
  });

  it('shows add asset form when clicking Add Asset button', () => {
    assetsPage.clickAddAsset();
    assetsPage.verifyAssetFormVisible();
  });

  it('hides form when clicking Cancel', () => {
    assetsPage.clickAddAsset();
    assetsPage.clickCancel();
    cy.contains('Add New Asset').should('not.exist');
  });

  it('adds a retirement account successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    assetsPage.clickAddAsset();
    assetsPage.selectAssetType('retirement');
    assetsPage.enterAccountName('401k - Vanguard');
    assetsPage.enterBalance('125000');
    assetsPage.selectAsOfDate(today);
    assetsPage.enterInstitution('Vanguard');
    assetsPage.enterAccountNumber('1234');
    assetsPage.enterNotes('Employer retirement account');
    assetsPage.submitAsset();
    
    cy.wait(1000);
    assetsPage.verifyAssetExists('401k - Vanguard', '125,000');
  });

  it('adds an investment account successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    assetsPage.clickAddAsset();
    assetsPage.selectAssetType('investment');
    assetsPage.enterAccountName('Brokerage Account');
    assetsPage.enterBalance('50000');
    assetsPage.selectAsOfDate(today);
    assetsPage.submitAsset();
    
    cy.wait(1000);
    assetsPage.verifyAssetExists('Brokerage Account', '50,000');
  });

  it('adds a savings account successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    assetsPage.addAsset('savings', 'Emergency Fund', '25000');
    cy.wait(1000);
    assetsPage.verifyAssetExists('Emergency Fund', '25,000');
  });

  it('calculates and displays total net worth', () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Add first asset
    assetsPage.addAsset('retirement', '401k', '100000');
    cy.wait(1000);
    
    // Net worth should update
    cy.contains('Total Net Worth').parent().should('contain', '$');
  });

  context('With Existing Assets', () => {
    beforeEach(() => {
      // Add a test asset
      const today = new Date().toISOString().split('T')[0];
      assetsPage.addAsset('investment', 'Test Portfolio', '75000');
      cy.wait(1000);
    });

    it('displays added asset in the list', () => {
      assetsPage.verifyAssetExists('Test Portfolio', '75,000');
    });

    it('edits an existing asset', () => {
      assetsPage.editFirstAsset();
      assetsPage.verifyAssetFormVisible();
      cy.contains('Edit Asset').should('be.visible');
    });

    it('deletes an asset', () => {
      assetsPage.confirmDelete();
      assetsPage.deleteFirstAsset();
      cy.wait(1000);
      // Asset should be removed
    });

    it('shows account type indicator', () => {
      cy.get('[class*="bg-slate-100"]').should('contain', 'Investment');
    });

    it('displays institution information', () => {
      const today = new Date().toISOString().split('T')[0];
      assetsPage.clickAddAsset();
      assetsPage.selectAssetType('retirement');
      assetsPage.enterAccountName('IRA Account');
      assetsPage.enterBalance('45000');
      assetsPage.enterInstitution('Fidelity');
      assetsPage.selectAsOfDate(today);
      assetsPage.submitAsset();
      cy.wait(1000);
      cy.contains('Fidelity').should('be.visible');
    });
  });

  it('shows empty state when no assets exist', () => {
    // Visit fresh or after deleting all
    cy.contains('No assets tracked yet').should('be.visible');
  });

  it('navigates back to finance dashboard', () => {
    assetsPage.clickBackToFinance();
    cy.url().should('include', '/finance');
    cy.url().should('not.include', '/assets');
  });

  it('displays as of date for each asset', () => {
    const today = new Date().toISOString().split('T')[0];
    assetsPage.addAsset('savings', 'Test Account', '10000');
    cy.wait(1000);
    cy.contains('As of').should('be.visible');
  });

  it('requires name and balance fields', () => {
    assetsPage.clickAddAsset();
    assetsPage.submitAsset();
    // Form should not submit without required fields
    cy.contains('Add New Asset').should('be.visible');
  });
});
