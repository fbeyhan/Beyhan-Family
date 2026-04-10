import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Change Password Page Object for Playwright
 * Contains all locators and methods for the Change Password page
 */
export class ChangePasswordPage extends BasePage {
  // Locators
  private readonly passwordInputs = 'input[type="password"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Change Password page from dashboard
   */
  async navigateToChangePassword(): Promise<void> {
    await this.clickByText('Change Password');
    await this.verifyElementExists('Change Password', { timeout: 10000 });
  }

  /**
   * Get all password input fields
   */
  private getPasswordInputs() {
    return this.page.locator(this.passwordInputs);
  }

  /**
   * Enter current password
   */
  async enterCurrentPassword(password: string): Promise<void> {
    await this.getPasswordInputs().nth(0).fill(password);
  }

  /**
   * Enter new password
   */
  async enterNewPassword(password: string): Promise<void> {
    await this.getPasswordInputs().nth(1).fill(password);
  }

  /**
   * Enter confirm password
   */
  async enterConfirmPassword(password: string): Promise<void> {
    await this.getPasswordInputs().nth(2).fill(password);
  }

  /**
   * Fill all password fields
   */
  async fillPasswordFields(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.enterCurrentPassword(currentPassword);
    await this.enterNewPassword(newPassword);
    await this.enterConfirmPassword(confirmPassword);
  }

  /**
   * Click Update Password button
   */
  async clickUpdatePassword(): Promise<void> {
    await this.page.getByRole('button', { name: 'Update Password' }).click();
  }

  /**
   * Click Back to Dashboard button
   */
  async clickBackToDashboard(): Promise<void> {
    await this.clickByText('Back to Dashboard');
  }

  /**
   * Verify all form elements exist
   */
  async verifyFormElements(): Promise<void> {
    // Verify there are 3 password input fields
    await expect(this.getPasswordInputs()).toHaveCount(3);
    await this.verifyElementExists('Current Password');
    await this.verifyElementExists('New Password');
    await this.verifyElementExists('Confirm New Password');
    await expect(this.page.getByRole('button', { name: 'Update Password' })).toBeVisible();
    await this.verifyElementExists('Back to Dashboard');
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }
}
