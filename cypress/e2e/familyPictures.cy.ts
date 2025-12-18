import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { FamilyPicturesPage } from '../support/pages/FamilyPicturesPage';

describe('Family Pictures', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const familyPicturesPage = new FamilyPicturesPage();

  beforeEach(() => {
    // Login and navigate to Family Pictures page
    loginPage.visitLoginPage();
    loginPage.login('fbeyhan@hotmail.com', 'Fatih1978');
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToFamilyPictures();
  });

  afterEach(() => {
    familyPicturesPage.clearStorage();
  });

  it('displays all page elements', () => {
    familyPicturesPage.verifyPageElements();
  });

  it.skip('uploads, verifies, views, and deletes a photo', () => {
    const testCaption = 'Test Photo for Cypress';
    const testImagePath = 'cypress/fixtures/test-image.jpg';

    // Upload photo with caption
    familyPicturesPage.uploadPhotoWithCaption(testCaption, testImagePath);

    // Verify photo appears in the gallery
    familyPicturesPage.verifyPhotoExists(testCaption);

    // Click on the photo to view it
    familyPicturesPage.clickPhotoByCaption(testCaption);

    // Verify modal opens with photo details
    familyPicturesPage.verifyModalOpen();
    familyPicturesPage.verifyElementExists(testCaption);

    // Delete the photo
    familyPicturesPage.clickDeleteButton();

    // Verify photo is deleted
    familyPicturesPage.verifyPhotoDeleted(testCaption);
  });

  it.skip('edits photo caption', () => {
    const originalCaption = 'Original Caption';
    const updatedCaption = 'Updated Caption';
    const testImagePath = 'cypress/fixtures/test-image.jpg';

    // Upload a photo first
    familyPicturesPage.uploadPhotoWithCaption(originalCaption, testImagePath);

    // Click edit button
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
