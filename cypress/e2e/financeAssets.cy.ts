import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FinancePage } from '../support/pages/FinancePage';
import { FinanceAssetsPage } from '../support/pages/FinanceAssetsPage';

describe('Finance - Assets Tracking', () => {
  const loginPage = new LoginPage();
  const assetsPage = new FinanceAssetsPage();
  const dashboardPage = new DashboardPage();
  const financePage = new FinancePage();

  beforeEach(() => {
    // Clear auth state and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToPersonalFinance();
    financePage.clickAssets();
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

  it.skip('adds a retirement account successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    assetsPage.clickAddAsset();
    assetsPage.selectAssetType('retirement');
    assetsPage.enterAccountName('401k - Vanguard');
    assetsPage.enterBalance('1');
    assetsPage.selectAsOfDate(today);
    assetsPage.enterInstitution('Vanguard');
    assetsPage.enterAccountNumber('1234');
    assetsPage.enterNotes('Employer retirement account');
    assetsPage.submitAsset();
    
    cy.wait(1000);
    assetsPage.verifyAssetExists('401k - Vanguard', '1');
  });

  it.skip('adds an investment account successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    assetsPage.clickAddAsset();
    assetsPage.selectAssetType('investment');
    assetsPage.enterAccountName('Brokerage Account');
    assetsPage.enterBalance('1');
    assetsPage.selectAsOfDate(today);
    assetsPage.submitAsset();
    
    cy.wait(1000);
    assetsPage.verifyAssetExists('Brokerage Account', '1');
  });

  it.skip('adds a savings account successfully', () => {
    const today = new Date().toISOString().split('T')[0];
    
    assetsPage.addAsset('savings', 'Emergency Fund', '1');
    cy.wait(1000);
    assetsPage.verifyAssetExists('Emergency Fund', '1');
  });

  it.skip('calculates and displays total net worth', () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Add first asset
    assetsPage.addAsset('retirement', '401k', '2');
    cy.wait(1000);
    
    // Net worth should update
    cy.contains('Total Net Worth').parent().should('contain', '$');
  });

  context('With Existing Assets', () => {
    beforeEach(() => {
      // Add a test asset
      const today = new Date().toISOString().split('T')[0];
      assetsPage.addAsset('investment', 'Test Portfolio', '1');
      cy.wait(1000);
    });

    it.skip('displays added asset in the list', () => {
      assetsPage.verifyAssetExists('Test Portfolio', '1');
    });

    it.skip('edits an existing asset', () => {
      assetsPage.editFirstAsset();
      assetsPage.verifyAssetFormVisible();
      cy.contains('h2', 'Edit Asset').should('be.visible');
    });

    it.skip('deletes an asset', () => {
      assetsPage.confirmDelete();
      assetsPage.deleteFirstAsset();
      cy.wait(1000);
      // Asset should be removed
    });

    it('shows account type indicator', () => {
      cy.get('[class*="bg-slate-100"]').should('contain', 'Investment');
    });

    it.skip('displays institution information', () => {
      const today = new Date().toISOString().split('T')[0];
      assetsPage.clickAddAsset();
      assetsPage.selectAssetType('retirement');
      assetsPage.enterAccountName('IRA Account');
      assetsPage.enterBalance('3');
      assetsPage.enterInstitution('Fidelity');
      assetsPage.selectAsOfDate(today);
      assetsPage.submitAsset();
      cy.wait(1000);
      cy.contains('Fidelity').should('be.visible');
    });
  });

  // it('shows empty state when no assets exist', () => {
  //   // Visit fresh or after deleting all
  //   cy.contains('No assets tracked yet').should('be.visible');
  // });

  it('navigates back to finance dashboard', () => {
    assetsPage.clickBackToFinance();
    cy.url().should('include', '/finance');
    cy.url().should('not.include', '/assets');
  });

  it.skip('displays as of date for each asset', () => {
    const today = new Date().toISOString().split('T')[0];
    assetsPage.addAsset('savings', 'Test Account', '4');
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
