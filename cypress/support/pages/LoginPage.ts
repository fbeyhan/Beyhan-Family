import { BasePage } from './BasePage';

/**
 * Login Page Object
 * Contains all locators and methods for the Login page
 */
export class LoginPage extends BasePage {
  // Locators
  private readonly emailInput = 'input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';
  private readonly signInButton = 'button';
  
  /**
   * Visit the login page
   */
  visitLoginPage(): void {
    this.clearStorage();
    this.visit('/');
  }

  /**
   * Enter email address
   */
  enterEmail(email: string): void {
    cy.get(this.emailInput).clear().type(email);
  }

  /**
   * Enter password
   */
  enterPassword(password: string): void {
    cy.get(this.passwordInput).clear().type(password);
  }

  /**
   * Click Sign In button
   */
  clickSignIn(): void {
    cy.contains(this.signInButton, 'Sign In').click();
  }

  /**
   * Perform login with credentials
   */
  login(email: string, password: string): void {
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickSignIn();
  }

  /**
   * Verify all login page elements exist
   */
  verifyLoginPageElements(): void {
    this.verifyElementExists('Beyhan Family');
    cy.get(this.emailInput).should('exist');
    cy.get(this.passwordInput).should('exist');
    cy.contains(this.signInButton, 'Sign In').should('exist');
  }

  /**
   * Verify error message is displayed
   */
  verifyErrorMessage(message: string): void {
    this.verifyElementExists(message);
  }

  /**
   * Verify successful login
   */
  verifySuccessfulLogin(): void {
    this.verifyElementExists('Beyhan Family', { timeout: 10000 });
  }
}
