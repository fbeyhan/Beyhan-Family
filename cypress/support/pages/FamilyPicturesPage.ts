import { BasePage } from './BasePage';

/**
 * Family Pictures Page Object
 * Contains all locators and methods for the Family Pictures page
 */
export class FamilyPicturesPage extends BasePage {
  // Locators
  private readonly captionInput = 'input[placeholder="Add a caption for your photo..."]';
  private readonly fileInput = 'input[type="file"]';
  private readonly uploadNewPhotoHeading = 'Upload New Photo';
  private readonly backToDashboardButton = 'Back to Dashboard';
  private readonly deleteButton = 'button';
  private readonly saveButton = 'button';
  private readonly modalBackdrop = '.fixed.inset-0';

  /**
   * Navigate to Family Pictures page from dashboard
   */
  navigateToFamilyPictures(): void {
    this.clickByText('Family Pictures');
    this.verifyElementExists('Family Pictures', { timeout: 10000 });
  }

  /**
   * Verify all page elements exist
   */
  verifyPageElements(): void {
    this.verifyElementExists(this.backToDashboardButton);
    this.verifyElementExists('Family Pictures');
    this.verifyElementExists(this.uploadNewPhotoHeading);
  }

  /**
   * Enter photo caption
   */
  enterCaption(caption: string): void {
    cy.get(this.captionInput).type(caption);
  }

  /**
   * Upload photo file
   */
  uploadPhoto(filePath: string): void {
    cy.get(this.fileInput).selectFile(filePath, { force: true });
  }

  /**
   * Upload photo with caption
   */
  uploadPhotoWithCaption(caption: string, filePath: string): void {
    this.enterCaption(caption);
    this.uploadPhoto(filePath);
    this.wait(10000); // Wait for upload to complete
    this.reload();
    this.wait(2000); // Wait after reload
  }

  /**
   * Click on photo by caption
   */
  clickPhotoByCaption(caption: string): void {
    cy.contains(caption, { timeout: 10000 }).parent().parent().click();
  }

  /**
   * Verify modal is open
   */
  verifyModalOpen(): void {
    cy.get(this.modalBackdrop).should('exist');
  }

  /**
   * Click delete button in modal
   */
  clickDeleteButton(): void {
    cy.contains(this.deleteButton, 'Delete').click();
    this.autoConfirmDialog();
    this.wait(2000);
  }

  /**
   * Click edit button for photo
   */
  clickEditButton(caption: string): void {
    cy.contains(caption, { timeout: 10000 }).parent().parent().find('button').first().click();
  }

  /**
   * Edit photo caption
   */
  editCaption(oldCaption: string, newCaption: string): void {
    cy.get(`input[value="${oldCaption}"]`).clear().type(newCaption);
    cy.contains(this.saveButton, 'Save').click();
    this.wait(1000);
  }

  /**
   * Verify photo exists
   */
  verifyPhotoExists(caption: string): void {
    this.verifyElementExists(caption, { timeout: 10000 });
  }

  /**
   * Verify photo does not exist
   */
  verifyPhotoDeleted(caption: string): void {
    this.verifyElementNotExists(caption);
  }

  /**
   * Click Back to Dashboard
   */
  clickBackToDashboard(): void {
    this.clickByText(this.backToDashboardButton);
  }
}
