import { BasePage } from './BasePage';

/**
 * Change Password Page Object
 * Contains all locators and methods for the Change Password page
 */
export class ChangePasswordPage extends BasePage {
  // Locators
  private readonly passwordInputs = 'input[type="password"]';
  private readonly updatePasswordButton = 'button';
  private readonly backToDashboardButton = 'Back to Dashboard';

  /**
   * Navigate to Change Password page from dashboard
   */
  navigateToChangePassword(): void {
    this.clickByText('Change Password');
    this.verifyElementExists('Change Password', { timeout: 10000 });
  }

  /**
   * Enter current password
   */
  enterCurrentPassword(password: string): void {
    cy.get(this.passwordInputs).eq(0).type(password);
  }

  /**
   * Enter new password
   */
  enterNewPassword(password: string): void {
    cy.get(this.passwordInputs).eq(1).type(password);
  }

  /**
   * Enter confirm password
   */
  enterConfirmPassword(password: string): void {
    cy.get(this.passwordInputs).eq(2).type(password);
  }

  /**
   * Fill all password fields
   */
  fillPasswordFields(currentPassword: string, newPassword: string, confirmPassword: string): void {
    this.enterCurrentPassword(currentPassword);
    this.enterNewPassword(newPassword);
    this.enterConfirmPassword(confirmPassword);
  }

  /**
   * Click Update Password button
   */
  clickUpdatePassword(): void {
    cy.contains(this.updatePasswordButton, 'Update Password').click();
  }

  /**
   * Click Back to Dashboard button
   */
  clickBackToDashboard(): void {
    this.clickByText(this.backToDashboardButton);
  }

  /**
   * Verify all form elements exist
   */
  verifyFormElements(): void {
    cy.get(this.passwordInputs).should('have.length', 3);
    this.verifyElementExists('Current Password');
    this.verifyElementExists('New Password');
    this.verifyElementExists('Confirm New Password');
    cy.contains(this.updatePasswordButton, 'Update Password').should('exist');
    this.verifyElementExists(this.backToDashboardButton);
  }

  /**
   * Verify error message is displayed
   */
  verifyErrorMessage(message: string): void {
    this.verifyElementExists(message);
  }
}
