import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object for Playwright
 * Contains all locators and methods for the Login page
 */
export class LoginPage extends BasePage {
  // Locators
  private readonly emailInput = 'input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Visit the login page
   */
  async visitLoginPage(): Promise<void> {
    await this.goto('/');
    await this.clearStorage();
  }

  /**
   * Enter email address
   */
  async enterEmail(email: string): Promise<void> {
    await this.page.locator(this.emailInput).clear();
    await this.page.locator(this.emailInput).fill(email);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.page.locator(this.passwordInput).clear();
    await this.page.locator(this.passwordInput).fill(password);
  }

  /**
   * Click Sign In button
   */
  async clickSignIn(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  /**
   * Verify all login page elements exist
   */
  async verifyLoginPageElements(): Promise<void> {
    await this.verifyElementExists('Beyhan Family');
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(message: string): Promise<void> {
    await this.verifyElementExists(message);
  }

  /**
   * Verify successful login by checking dashboard elements
   */
  async verifySuccessfulLogin(): Promise<void> {
    await this.verifyElementExists('Beyhan Family', { timeout: 10000 });
    await this.verifyUrlContains('/dashboard');
  }

  /**
   * Get email input element
   */
  getEmailInput() {
    return this.page.locator(this.emailInput);
  }

  /**
   * Get password input element
   */
  getPasswordInput() {
    return this.page.locator(this.passwordInput);
  }

  /**
   * Get sign in button
   */
  getSignInButton() {
    return this.page.getByRole('button', { name: 'Sign In' });
  }
}
