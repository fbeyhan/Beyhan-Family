import { LoginPage } from '../support/pages/LoginPage';
import { FinanceAddPage } from '../support/pages/FinanceAddPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FinancePage } from '../support/pages/FinancePage';
import { FinanceTransactionsPage } from '../support/pages/FinanceTransactionsPage';

describe.skip('Finance - Transaction History', () => {
  const loginPage = new LoginPage();
  const financeAddPage = new FinanceAddPage();
  const dashboardPage = new DashboardPage();
  const financePage = new FinancePage();
  const transactionsPage = new FinanceTransactionsPage();

  before(() => {
    // Clear auth state and login as admin ONCE
    cy.clearCookies();
    cy.clearLocalStorage();
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToPersonalFinance();
  });

  it('displays transactions page with all elements', () => {
    financePage.clickTransactions();
    transactionsPage.verifyTransactionsPageElements();
  });

  context('With Transaction Data', () => {
    beforeEach(() => {
      // Add a test transaction
      //financePage.clickTransactions();
      // financeAddPage.visitFinanceAddPage();
      financePage.clickAddTransaction();
      const today = new Date().toISOString().split('T')[0];
      financeAddPage.selectExpenseType();
      financeAddPage.enterAmount('75.00');
      financeAddPage.selectDate(today);
      financeAddPage.selectCategory('Food');
      financeAddPage.enterDescription('Test expense for Cypress');
      financeAddPage.submitTransaction();
      cy.wait(1000);
      financeAddPage.clickBackToFinance();
      // dashboardPage.navigateToPersonalFinance();
      financePage.clickTransactions();
      //transactionsPage.visitTransactionsPage();
    });

    it.skip('displays added transactions in the list', () => {
      transactionsPage.verifyTransactionExists('75.00', 'Food');
    });

    it.skip('filters transactions by type - expenses only', () => {
      transactionsPage.filterByType('expense');
      transactionsPage.verifyFilteredResults('expense');
    });

    it.skip('filters transactions by type - income only', () => {
      transactionsPage.filterByType('income');
      // May show "No transactions found" if no income exists
    });

    it.skip('filters transactions by category', () => {
      transactionsPage.filterByCategory('Food');
      transactionsPage.verifyTransactionExists('75.00', 'Food');
    });

    it.skip('filters transactions by date range - this month', () => {
      transactionsPage.filterByDateRange('month');
      transactionsPage.verifyTransactionExists('75.00', 'Food');
    });

    it.skip('searches transactions by description', () => {
      transactionsPage.searchTransactions('Cypress');
      transactionsPage.verifyTransactionExists('75.00', 'Food');
    });

    it.skip('deletes a transaction', () => {
      // Find and delete the transaction with amount 75.00
      transactionsPage.deleteTransactionByAmountAndCategory('75.00', 'Food');
      cy.wait(1000);
      // Verify the transaction is removed from the list
      transactionsPage.verifyTransactionNotExists('75.00', 'Food');
    });

    it.skip('shows empty state when no transactions match filters', () => {
      transactionsPage.visitTransactionsPage();
      transactionsPage.searchTransactions('nonexistentxyz123');
      transactionsPage.verifyNoTransactions();
    });

    it.skip('navigates back to finance dashboard', () => {
      transactionsPage.visitTransactionsPage();
      transactionsPage.clickBackToFinance();
      cy.url().should('include', '/finance');
      cy.url().should('not.include', '/transactions');
    });

    it.skip('resets filters to show all transactions', () => {
      transactionsPage.visitTransactionsPage();
      transactionsPage.filterByType('expense');
      transactionsPage.filterByType('all');
      // Should show all transactions again
    });
  });

  context('Edit Transaction Functionality', () => {
    beforeEach(() => {
      // Add a test transaction to edit
      financeAddPage.visitFinanceAddPage();
      const today = new Date().toISOString().split('T')[0];
      financeAddPage.selectExpenseType();
      financeAddPage.enterAmount('125.50');
      financeAddPage.selectDate(today);
      financeAddPage.selectCategory('Shopping');
      financeAddPage.enterMerchant('Test Store');
      financeAddPage.selectPaymentMethod('Credit Card');
      financeAddPage.enterDescription('Original transaction for edit test');
      financeAddPage.submitTransaction();
      cy.wait(1000);
      
      transactionsPage.visitTransactionsPage();
    });

    it.skip('displays edit button for transactions', () => {
      transactionsPage.verifyEditButtonExists();
    });

    it.skip('opens edit form when edit button is clicked', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.verifyEditFormVisible();
    });

    it.skip('edit form displays current transaction values', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.verifyEditFormContainsValue('125.50');
      transactionsPage.verifyEditFormContainsValue('Test Store');
      transactionsPage.verifyEditFormContainsValue('Original transaction for edit test');
    });

    it.skip('cancels edit without saving changes', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.editAmount('200.00');
      transactionsPage.clickCancelEdit();
      transactionsPage.verifyTransactionExists('125.50', 'Shopping');
    });

    it.skip('edits transaction amount and saves', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.editAmount('99.99');
      transactionsPage.clickSaveEdit();
      cy.wait(1000);
      transactionsPage.verifyTransactionExists('99.99', 'Shopping');
    });

    it.skip('edits transaction merchant and saves', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.editMerchant('Updated Store Name');
      transactionsPage.clickSaveEdit();
      cy.wait(1000);
      cy.contains('Updated Store Name').should('be.visible');
    });

    it.skip('edits transaction description and saves', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.editDescription('Updated description via Cypress test');
      transactionsPage.clickSaveEdit();
      cy.wait(1000);
      cy.contains('Updated description via Cypress test').should('be.visible');
    });

    it.skip('edits transaction date and saves', () => {
      transactionsPage.clickEditFirstTransaction();
      const newDate = '2025-12-15';
      transactionsPage.editDate(newDate);
      transactionsPage.clickSaveEdit();
      cy.wait(1000);
      cy.contains('12/15/2025').should('be.visible');
    });

    it.skip('edits multiple fields simultaneously', () => {
      transactionsPage.clickEditFirstTransaction();
      transactionsPage.editAmount('250.75');
      transactionsPage.editMerchant('Multi-Edit Store');
      transactionsPage.editPaymentMethod('Debit Card');
      transactionsPage.editDescription('All fields updated');
      transactionsPage.clickSaveEdit();
      cy.wait(1000);
      transactionsPage.verifyTransactionExists('250.75', 'Shopping');
      cy.contains('Multi-Edit Store').should('be.visible');
      cy.contains('Debit Card').should('be.visible');
      cy.contains('All fields updated').should('be.visible');
    });

    it.skip('deletes the edited transaction at the end', () => {
      // Delete the transaction with the final edited amount and category
      transactionsPage.deleteTransactionByAmountAndCategory('250.75', 'Shopping');
      cy.wait(1000);
      transactionsPage.verifyTransactionNotExists('250.75', 'Shopping');
    });
  });
});
