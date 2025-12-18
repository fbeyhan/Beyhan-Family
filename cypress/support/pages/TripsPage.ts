import { BasePage } from './BasePage';

/**
 * Trips Page Object
 * Contains all locators and methods for the Trips page
 */
export class TripsPage extends BasePage {
  // Locators
  private readonly addNewTripButton = 'button';
  private readonly tripTitleInput = 'input[placeholder="e.g., Summer Vacation 2024"]';
  private readonly tripLocationInput = 'input[placeholder="e.g., Paris, France"]';
  private readonly tripDescriptionTextarea = 'textarea[placeholder="Add notes, highlights, or memories from this trip..."]';
  private readonly addTripButton = 'button';
  private readonly updateTripButton = 'button';
  private readonly deleteTripButton = 'button';
  private readonly uploadPhotoButton = 'Upload Photo';
  private readonly captionInput = 'input[placeholder="Add a caption for your photo..."]';
  private readonly fileInput = 'input[type="file"]';
  private readonly backToTripsButton = 'Back to Trips';
  private readonly backToDashboardButton = 'Back to Dashboard';
  private readonly deleteButton = 'button';

  /**
   * Navigate to Trips page from dashboard
   */
  navigateToTrips(): void {
    this.clickByText('Trips');
    this.verifyElementExists('Family Trips', { timeout: 10000 });
  }

  /**
   * Verify all page elements exist
   */
  verifyPageElements(): void {
    this.verifyElementExists(this.backToDashboardButton);
    this.verifyElementExists('Family Trips');
    cy.contains(this.addNewTripButton, 'Add New Trip').should('exist');
  }

  /**
   * Click Add New Trip button
   */
  clickAddNewTrip(): void {
    cy.contains(this.addNewTripButton, 'Add New Trip').click();
    this.verifyElementExists('Add New Trip');
  }

  /**
   * Fill trip details
   */
  fillTripDetails(title: string, location: string, description?: string): void {
    cy.get(this.tripTitleInput).type(title);
    cy.get(this.tripLocationInput).type(location);
    if (description) {
      cy.get(this.tripDescriptionTextarea).type(description);
    }
  }

  /**
   * Click Add Trip button
   */
  clickAddTrip(): void {
    cy.contains(this.addTripButton, 'Add Trip').click();
    this.wait(8000); // Wait for trip to be added
    this.reload();
    this.wait(2000); // Wait after reload
  }

  /**
   * Create a new trip
   */
  createTrip(title: string, location: string, description: string): void {
    this.clickAddNewTrip();
    this.fillTripDetails(title, location, description);
    this.clickAddTrip();
  }

  /**
   * Click on trip by title
   */
  clickTripByTitle(title: string): void {
    cy.contains(title, { timeout: 10000 }).click();
  }

  /**
   * Upload photo to trip
   */
  uploadPhotoToTrip(caption: string, filePath: string): void {
    cy.get(this.captionInput).type(caption);
    cy.get(this.fileInput).selectFile(filePath, { force: true });
    this.wait(10000); // Wait for upload to complete
    this.reload();
    this.wait(2000); // Wait after reload
  }

  /**
   * Click on photo in trip
   */
  clickPhotoInTrip(tripTitle: string, photoCaption: string): void {
    this.clickTripByTitle(tripTitle);
    cy.contains(photoCaption, { timeout: 10000 }).parent().parent().click();
  }

  /**
   * Delete photo from trip
   */
  deletePhotoFromTrip(): void {
    cy.contains(this.deleteButton, 'Delete').click();
    this.autoConfirmDialog();
    this.wait(2000);
  }

  /**
   * Click Back to Trips
   */
  clickBackToTrips(): void {
    this.clickByText(this.backToTripsButton);
  }

  /**
   * Click edit button for trip
   */
  clickEditTrip(tripTitle: string): void {
    cy.contains(tripTitle, { timeout: 10000 }).parent().parent().parent().find('button').first().click();
  }

  /**
   * Update trip details
   */
  updateTripDetails(oldTitle: string, newTitle: string, oldLocation: string, newLocation: string): void {
    cy.get(`input[value="${oldTitle}"]`).clear().type(newTitle);
    cy.get(`input[value="${oldLocation}"]`).clear().type(newLocation);
    cy.contains(this.updateTripButton, 'Update Trip').click();
    this.wait(3000); // Wait for update to complete
  }

  /**
   * Delete trip
   */
  deleteTrip(tripTitle: string): void {
    cy.contains(tripTitle, { timeout: 10000 }).parent().parent().parent().find('button').first().click();
    cy.contains(this.deleteTripButton, 'Delete Trip').click();
    this.autoConfirmDialog();
    this.wait(2000);
  }

  /**
   * Verify trip exists
   */
  verifyTripExists(title: string): void {
    this.verifyElementExists(title, { timeout: 10000 });
  }

  /**
   * Verify trip does not exist
   */
  verifyTripDeleted(title: string): void {
    this.verifyElementNotExists(title);
  }

  /**
   * Click Back to Dashboard
   */
  clickBackToDashboard(): void {
    this.clickByText(this.backToDashboardButton);
  }
}
