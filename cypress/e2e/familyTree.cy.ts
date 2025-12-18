import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FamilyTreePage } from '../support/pages/FamilyTreePage';

describe('Family Tree', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const familyTreePage = new FamilyTreePage();

  beforeEach(() => {
    // Login and navigate to Family Tree page
    loginPage.visitLoginPage();
    loginPage.login('fbeyhan@hotmail.com', 'Fatih1978');
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToFamilyTree();
  });

  afterEach(() => {
    familyTreePage.clearStorage();
  });

  it('displays all page elements', () => {
    familyTreePage.verifyPageElements();
  });

  it('switches between tree and list view', () => {
    familyTreePage.switchToListView();
    familyTreePage.switchToTreeView();
  });

  it.skip('creates a family member with photo and deletes both', () => {
    const firstName = 'Cypress';
    const lastName = 'Test';
    const fullName = `${firstName} ${lastName}`;
    const birthPlace = 'Test City';
    const gender = 'male';
    const testImagePath = 'cypress/fixtures/test-image.jpg';

    // Create family member with photo
    familyTreePage.createFamilyMember(firstName, lastName, birthPlace, gender, testImagePath);

    // Verify member appears
    familyTreePage.verifyMemberExists(fullName);

    // Click on member to view details
    familyTreePage.clickMemberByName(fullName);

    // Verify profile photo is displayed
    familyTreePage.verifyProfilePhotoExists(fullName);

    // Close modal
    familyTreePage.closeModal();

    // Delete member
    familyTreePage.deleteMember(fullName);

    // Verify member deleted
    familyTreePage.verifyMemberDeleted(fullName);
  });

  it.skip('edits family member details', () => {
    const originalFirstName = 'Edit';
    const lastName = 'Test';
    const originalFullName = `${originalFirstName} ${lastName}`;
    const updatedFirstName = 'Updated';
    const updatedFullName = `${updatedFirstName} ${lastName}`;
    const updatedBirthPlace = 'Updated City';

    // Create member
    familyTreePage.createFamilyMember(originalFirstName, lastName, '', 'male');

    // Verify member exists
    familyTreePage.verifyMemberExists(originalFullName);

    // Click edit button
    familyTreePage.clickEditMember(originalFullName);

    // Update details
    familyTreePage.updateMemberDetails(originalFirstName, updatedFirstName, updatedBirthPlace);

    // Verify update
    familyTreePage.verifyMemberExists(updatedFullName);

    // Cleanup
    familyTreePage.deleteMember(updatedFullName);
  });

  it('navigates back to dashboard', () => {
    familyTreePage.clickBackToDashboard();
    familyTreePage.verifyUrlContains('/dashboard');
  });
});
