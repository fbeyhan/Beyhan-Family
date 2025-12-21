
import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FamilyPicturesPage } from '../support/pages/FamilyPicturesPage';

describe('Family Pictures', () => {
  // Page objects
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const familyPicturesPage = new FamilyPicturesPage();

  beforeEach(() => {
    // Login before each test and navigate to Family Pictures
    loginPage.visitLoginPage();
    loginPage.login(Cypress.env('TEST_EMAIL'), Cypress.env('TEST_PASSWORD'));
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToFamilyPictures();
  });

  afterEach(() => {
    // Clear storage after each test
    familyPicturesPage.clearStorage();
  });

  it('displays all page elements', () => {
    // Assert all expected elements are visible
    familyPicturesPage.verifyPageElements();
  });

  it.skip('uploads, verifies, views, and deletes a photo', () => {
    const testCaption = 'Test Photo for Cypress';
    const testImagePath = 'cypress/fixtures/test-image.jpg';
    // Upload photo
    familyPicturesPage.uploadPhotoWithCaption(testCaption, testImagePath);
    // Verify photo appears
    familyPicturesPage.verifyPhotoExists(testCaption);
    // View photo
    familyPicturesPage.clickPhotoByCaption(testCaption);
    // Verify modal and details
    familyPicturesPage.verifyModalOpen();
    familyPicturesPage.verifyElementExists(testCaption);
    // Delete photo
    familyPicturesPage.clickDeleteButton();
    // Verify deletion
    familyPicturesPage.verifyPhotoDeleted(testCaption);
  });

  it.skip('edits photo caption', () => {
    const originalCaption = 'Original Caption';
    const updatedCaption = 'Updated Caption';
    const testImagePath = 'cypress/fixtures/test-image.jpg';
    // Upload photo
    familyPicturesPage.uploadPhotoWithCaption(originalCaption, testImagePath);
    // Edit caption
    familyPicturesPage.clickEditButton(originalCaption);

    // Edit caption
    familyPicturesPage.editCaption(originalCaption, updatedCaption);

    // Verify caption updated
    familyPicturesPage.verifyPhotoExists(updatedCaption);

    // Cleanup: Delete the photo
    familyPicturesPage.clickPhotoByCaption(updatedCaption);
    familyPicturesPage.clickDeleteButton();
  });

  it('navigates back to dashboard', () => {
    familyPicturesPage.clickBackToDashboard();
    familyPicturesPage.verifyUrlContains('/dashboard');
  });
});
