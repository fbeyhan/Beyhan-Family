import { BasePage } from './BasePage';

/**
 * Finance Assets Page Object
 * Handles interactions with the assets tracking page
 */
export class FinanceAssetsPage extends BasePage {
  /**
   * Visit the assets page
   */
  visitAssetsPage(): void {
    this.visit('/finance/assets');
  }

  /**
   * Verify assets page elements
   */
  verifyAssetsPageElements(): void {
    cy.contains('Assets & Accounts').should('be.visible');
    cy.contains('Track investments, retirement, and savings').should('be.visible');
    cy.contains('Total Net Worth').should('be.visible');
    cy.contains('Add Asset').should('be.visible');
  }

  /**
   * Click Add Asset button
   */
  clickAddAsset(): void {
    cy.contains('Add Asset').click();
  }

  /**
   * Verify asset form is visible
   */
  verifyAssetFormVisible(): void {
    // Try both possible headings for robustness
    cy.contains('h2', /Edit Asset|Add New Asset/).should('be.visible');
    cy.contains('Type').should('be.visible');
    cy.contains('Account Name').should('be.visible');
    cy.contains('Balance').should('be.visible');
  }

  /**
   * Select asset type
   */
  selectAssetType(type: 'investment' | 'retirement' | 'savings' | 'property'): void {
    cy.contains('Type').parent().find('select').select(type);
  }

  /**
   * Enter account name
   */
  enterAccountName(name: string): void {
    cy.contains('Account Name').parent().find('input').type(name);
  }

  /**
   * Enter balance
   */
  enterBalance(balance: string): void {
    cy.contains('Balance').parent().find('input[type="number"]').type(balance);
  }

  /**
   * Select as of date
   */
  selectAsOfDate(date: string): void {
    cy.contains('As of Date').parent().find('input[type="date"]').clear().type(date);
  }

  /**
   * Enter institution
   */
  enterInstitution(institution: string): void {
    cy.contains('Institution').parent().find('input').type(institution);
  }

  /**
   * Enter account number
   */
  enterAccountNumber(accountNumber: string): void {
    cy.contains('Account Number').parent().find('input').type(accountNumber);
  }

  /**
   * Enter notes
   */
  enterNotes(notes: string): void {
    cy.contains('Notes').parent().find('textarea').type(notes);
  }

  /**
   * Submit asset form
   */
  submitAsset(): void {
    cy.contains('Add Asset').last().click();
  }

  /**
   * Add a complete asset
   */
  addAsset(type: string, name: string, balance: string): void {
    this.clickAddAsset();
    this.selectAssetType(type as any);
    this.enterAccountName(name);
    this.enterBalance(balance);
    this.submitAsset();
  }

  /**
   * Verify asset exists
   */
  verifyAssetExists(name: string, balance: string): void {
    cy.contains(name).should('be.visible');
    cy.contains(balance).should('be.visible');
  }

  /**
   * Verify net worth
   */
  verifyNetWorth(expectedAmount: string): void {
    cy.contains('Total Net Worth').parent().should('contain', expectedAmount);
  }

  /**
   * Edit first asset
   */
  editFirstAsset(): void {
    cy.contains('Edit').first().click();
  }

  /**
   * Delete first asset
   */
  deleteFirstAsset(): void {
    cy.contains('Delete').first().click();
  }

  /**
   * Confirm delete dialog
   */
  confirmDelete(): void {
    cy.on('window:confirm', () => true);
  }

  /**
   * Verify no assets message
   */
  verifyNoAssets(): void {
    cy.contains('No assets tracked yet').should('be.visible');
  }

  /**
   * Click cancel on form
   */
  clickCancel(): void {
    cy.contains('Cancel').click();
  }

  /**
   * Click back to finance
   */
  clickBackToFinance(): void {
    cy.contains('Back to Finance').click();
  }
}
