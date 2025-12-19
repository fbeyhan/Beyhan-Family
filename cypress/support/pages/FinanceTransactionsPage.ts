import { BasePage } from './BasePage';

/**
 * Finance Transactions Page Object
 * Handles interactions with the transaction history page
 */
export class FinanceTransactionsPage extends BasePage {
  /**
   * Visit the transactions page
   */
  visitTransactionsPage(): void {
    this.visit('/finance/transactions');
  }

  /**
   * Verify transactions page elements
   */
  verifyTransactionsPageElements(): void {
    cy.contains('Transaction History').should('be.visible');
    cy.contains('Type').should('be.visible');
    cy.contains('Category').should('be.visible');
    cy.contains('Date Range').should('be.visible');
    cy.contains('Search').should('be.visible');
  }

  /**
   * Filter by type
   */
  filterByType(type: 'all' | 'expense' | 'income'): void {
    cy.contains('Type').parent().find('select').select(type);
  }

  /**
   * Filter by category
   */
  filterByCategory(category: string): void {
    cy.contains('Category').parent().find('select').select(category);
  }

  /**
   * Filter by date range
   */
  filterByDateRange(range: 'all' | 'today' | 'week' | 'month' | 'year'): void {
    cy.contains('Date Range').parent().find('select').select(range);
  }

  /**
   * Search transactions
   */
  searchTransactions(searchTerm: string): void {
    cy.contains('Search').parent().find('input').type(searchTerm);
  }

  /**
   * Verify transaction exists
   */
  verifyTransactionExists(amount: string, category: string): void {
    cy.contains(category).should('be.visible');
    cy.contains(amount).should('be.visible');
  }

  /**
   * Verify transactions count
   */
  verifyTransactionsCount(expectedText: string): void {
    cy.contains('Showing').parent().should('contain', expectedText);
  }

  /**
   * Delete first transaction
   */
  deleteFirstTransaction(): void {
    cy.contains('Delete').first().click();
  }

  /**
   * Confirm delete dialog
   */
  confirmDelete(): void {
    cy.on('window:confirm', () => true);
  }

  /**
   * Verify no transactions message
   */
  verifyNoTransactions(): void {
    cy.contains('No transactions found').should('be.visible');
  }

  /**
   * Verify filter results
   */
  verifyFilteredResults(expectedType?: string): void {
    if (expectedType) {
      cy.get('[class*="bg-green-100"], [class*="bg-red-100"]').each(($el) => {
        cy.wrap($el).should('contain', expectedType);
      });
    }
  }

  /**
   * Click back to finance
   */
  clickBackToFinance(): void {
    cy.contains('Back to Finance').click();
  }

  /**
   * Verify edit button exists
   */
  verifyEditButtonExists(): void {
    cy.contains('Edit').should('be.visible');
  }

  /**
   * Click edit on first transaction
   */
  clickEditFirstTransaction(): void {
    cy.contains('Edit').first().click();
  }

  /**
   * Verify edit form is visible
   */
  verifyEditFormVisible(): void {
    cy.contains('Edit Transaction').should('be.visible');
    cy.contains('Save Changes').should('be.visible');
    cy.contains('Cancel').should('be.visible');
  }

  /**
   * Verify edit form contains specific value
   */
  verifyEditFormContainsValue(value: string): void {
    cy.get('input, textarea').should(($inputs) => {
      const values = $inputs.toArray().map(el => (el as HTMLInputElement).value);
      expect(values.some(v => v.includes(value))).to.be.true;
    });
  }

  /**
   * Edit amount in edit form
   */
  editAmount(newAmount: string): void {
    cy.contains('Amount').parent().find('input[type="number"]').clear().type(newAmount);
  }

  /**
   * Edit merchant in edit form
   */
  editMerchant(newMerchant: string): void {
    cy.contains('Merchant').parent().find('input[type="text"]').clear().type(newMerchant);
  }

  /**
   * Edit payment method in edit form
   */
  editPaymentMethod(newPaymentMethod: string): void {
    cy.contains('Payment Method').parent().find('input[type="text"]').clear().type(newPaymentMethod);
  }

  /**
   * Edit description in edit form
   */
  editDescription(newDescription: string): void {
    cy.contains('Description').parent().find('textarea').clear().type(newDescription);
  }

  /**
   * Edit date in edit form
   */
  editDate(newDate: string): void {
    cy.contains('Date').parent().find('input[type="date"]').clear().type(newDate);
  }

  /**
   * Click save edit button
   */
  clickSaveEdit(): void {
    cy.contains('Save Changes').click();
  }

  /**
   * Click cancel edit button
   */
  clickCancelEdit(): void {
    cy.contains('Cancel').click();
  }
}
