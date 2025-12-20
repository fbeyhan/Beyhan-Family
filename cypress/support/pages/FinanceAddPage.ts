import { BasePage } from './BasePage';

/**
 * Finance Add Transaction Page Object
 * Handles interactions with the quick transaction entry form
 */
export class FinanceAddPage extends BasePage {
  /**
   * Visit the add transaction page
   */
  visitFinanceAddPage(): void {
    this.visit('/finance/add');
  }

  /**
   * Verify add transaction page elements
   */
  verifyAddTransactionPageElements(): void {
    cy.get('[data-cy="add-transaction-title"]').should('be.visible');
    cy.contains('Type').should('be.visible');
    cy.contains('Amount').should('be.visible');
    cy.contains('Date').should('be.visible');
    cy.contains('Category').should('be.visible');
    cy.get('[data-cy="save-transaction"]').should('be.visible');
  }

  /**
   * Select transaction type
   */
  selectType(type: 'expense' | 'income'): void {
    if (type === 'expense') {
      cy.get('[data-cy="type-expense"]').click();
    } else {
      cy.get('[data-cy="type-income"]').click();
    }
  }

  /**
   * Enter amount
   */
  enterAmount(amount: string): void {
    cy.get('input[type="number"][step="0.01"]').clear().type(amount);
  }

  /**
   * Select date
   */
  selectDate(date: string): void {
    cy.get('input[type="date"]').clear().type(date);
  }

  /**
   * Select category
   */
  selectCategory(category: string): void {
    cy.get('select').first().select(category);
  }

  /**
   * Select subcategory
   */
  selectSubcategory(subcategory: string): void {
    cy.get('select').eq(1).select(subcategory);
  }

  /**
   * Enter merchant
   */
  enterMerchant(merchant: string): void {
    cy.contains('Merchant').parent().find('input').type(merchant);
  }

  /**
   * Select payment method
   */
  selectPaymentMethod(method: string): void {
    cy.contains('Payment Method').parent().find('select').select(method);
  }

  /**
   * Enter description
   */
  enterDescription(description: string): void {
    cy.get('textarea').type(description);
  }

  /**
   * Submit transaction form
   */
  submitTransaction(): void {
    cy.get('[data-cy="save-transaction"]').click();
  }

  /**
   * Add a complete expense transaction
   */
  addExpense(amount: string, category: string, description?: string): void {
    this.selectType('expense');
    this.enterAmount(amount);
    this.selectCategory(category);
    if (description) {
      this.enterDescription(description);
    }
    this.submitTransaction();
  }

  /**
   * Add a complete income transaction
   */
  addIncome(amount: string, category: string, description?: string): void {
    this.selectType('income');
    this.enterAmount(amount);
    this.selectCategory(category);
    if (description) {
      this.enterDescription(description);
    }
    this.submitTransaction();
  }

  /**
   * Verify success message
   */
  verifySuccessMessage(): void {
    cy.contains('Transaction added successfully').should('be.visible');
  }

  /**
   * Verify form is cleared after submission
   */
  verifyFormCleared(): void {
    cy.get('input[type="number"][step="0.01"]').should('have.value', '');
  }

  /**
   * Click back to finance
   */
  clickBackToFinance(): void {
    cy.get('[data-cy="back-to-finance"]').click();
  }
}
