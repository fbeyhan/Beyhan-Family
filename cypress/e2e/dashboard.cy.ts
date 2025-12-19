import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';

describe('Dashboard', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    // Login before each test
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'));
    loginPage.verifySuccessfulLogin();
  });

  afterEach(() => {
    dashboardPage.clearStorage();
  });

  it('displays all dashboard elements', () => {
    dashboardPage.verifyDashboardElements();
  });

  it('displays all menu items', () => {
    dashboardPage.verifyMenuItems();
  });

  it('navigates to Family Pictures page', () => {
    dashboardPage.navigateToFamilyPictures();
    dashboardPage.verifyNavigationToPage('Family Pictures', '/family-pictures');
  });

  it('navigates to Trips page', () => {
    dashboardPage.navigateToTrips();
    dashboardPage.verifyNavigationToPage('Family Trips', '/trips');
  });

  it('navigates to Family Tree page', () => {
    dashboardPage.navigateToFamilyTree();
    dashboardPage.verifyNavigationToPage('Family Tree', '/family-tree');
  });

  it('navigates to Change Password page', () => {
    dashboardPage.navigateToChangePassword();
    dashboardPage.verifyNavigationToPage('Change Password', '/change-password');
  });

  it('logs out successfully', () => {
    dashboardPage.logout();
    dashboardPage.verifyUrlContains('/login');
    cy.get('input[type="email"]').should('exist');
  });
});
