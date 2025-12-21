import { BasePage } from './BasePage';

/**
 * Dashboard Page Object
 * Contains all locators and methods for the Dashboard page
 */

export class DashboardPage extends BasePage {
  // Locators
  private readonly logoutButton = 'button';

  /**
   * Navigate to Personal Finance page
   */
  navigateToPersonalFinance(): void {
    cy.get('a[data-discover="true"]').contains('Personal Finance').click();
  }

  /**
   * Verify all dashboard elements exist
   */
  verifyDashboardElements(): void {
    this.verifyElementExists('Beyhan Family');
    this.verifyElementExists('Welcome back');
    this.verifyElementExists('fbeyhan');
    this.verifyElementExists('Change Password');
    this.verifyElementExists('Logout');
  }

  /**
   * Verify all menu items exist
   */
  verifyMenuItems(): void {
    this.verifyElementExists('Family Pictures');
    this.verifyElementExists('Trips');
    this.verifyElementExists('Family Tree');
    this.verifyElementExists('View and browse our family photo collection');
    this.verifyElementExists('Explore memorable family trips and vacations');
    this.verifyElementExists('Discover our family genealogy and connections');
  }

  /**
   * Navigate to Family Pictures page
   */
  navigateToFamilyPictures(): void {
    this.clickByText('Family Pictures');
  }

  /**
   * Navigate to Trips page
   */
  navigateToTrips(): void {
    this.clickByText('Trips');
  }

  /**
   * Navigate to Family Tree page
   */
  navigateToFamilyTree(): void {
    this.clickByText('Family Tree');
  }

  /**
   * Navigate to Change Password page
   */
  navigateToChangePassword(): void {
    this.clickByText('Change Password');
  }

  /**
   * Click logout button
   */
  logout(): void {
    cy.contains(this.logoutButton, 'Logout').click();
  }

  /**
   * Verify navigation to specific page
   */
  verifyNavigationToPage(pageName: string, urlPath: string): void {
    this.verifyUrlContains(urlPath);
    this.verifyElementExists(pageName);
  }
}
