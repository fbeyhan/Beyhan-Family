import { LoginPage } from '../pages/LoginPage';

/**
 * Authentication Helper
 * Provides reusable authentication utilities for tests
 */
export class AuthHelper {
  private static loginPage = new LoginPage();

  /**
   * Default test credentials
   */
  static readonly TEST_USER = {
    email: 'fbeyhan@hotmail.com',
    password: 'Fatih1978'
  };

  /**
   * Perform login with default test credentials
   */
  static login(): void {
    this.loginPage.clearStorage();
    this.loginPage.visit('/');
    this.loginPage.login(this.TEST_USER.email, this.TEST_USER.password);
    this.loginPage.verifySuccessfulLogin();
  }

  /**
   * Perform login with custom credentials
   */
  static loginWithCredentials(email: string, password: string): void {
    this.loginPage.clearStorage();
    this.loginPage.visit('/');
    this.loginPage.login(email, password);
  }

  /**
   * Clear authentication state
   */
  static logout(): void {
    this.loginPage.clearStorage();
  }
}
