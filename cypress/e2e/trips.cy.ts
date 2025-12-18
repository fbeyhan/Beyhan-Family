import { LoginPage } from '../support/pages/LoginPage';
import { DashboardPage } from '../support/pages/DashboardPage';
import { TripsPage } from '../support/pages/TripsPage';

describe('Trips', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const tripsPage = new TripsPage();

  beforeEach(() => {
    // Login and navigate to Trips page
    loginPage.visitLoginPage();
    loginPage.login('fbeyhan@hotmail.com', 'Fatih1978');
    loginPage.verifySuccessfulLogin();
    dashboardPage.navigateToTrips();
  });

  afterEach(() => {
    tripsPage.clearStorage();
  });

  it('displays all page elements', () => {
    tripsPage.verifyPageElements();
  });

  it.skip('creates a trip, adds photo, and deletes both', () => {
    const tripTitle = 'Cypress Test Trip';
    const tripLocation = 'Test Location';
    const tripDescription = 'Test trip description';
    const photoCaption = 'Trip Photo Test';
    const testImagePath = 'cypress/fixtures/test-image.jpg';

    // Create new trip
    tripsPage.createTrip(tripTitle, tripLocation, tripDescription);

    // Verify trip exists
    tripsPage.verifyTripExists(tripTitle);

    // Click on the trip
    tripsPage.clickTripByTitle(tripTitle);

    // Upload photo to trip
    tripsPage.uploadPhotoToTrip(photoCaption, testImagePath);

    // Verify photo appears
    tripsPage.clickTripByTitle(tripTitle);
    tripsPage.verifyElementExists(photoCaption, { timeout: 10000 });

    // Delete photo
    tripsPage.clickPhotoInTrip(tripTitle, photoCaption);
    tripsPage.deletePhotoFromTrip();

    // Go back to trips list
    tripsPage.clickBackToTrips();

    // Delete trip
    tripsPage.deleteTrip(tripTitle);

    // Verify trip deleted
    tripsPage.verifyTripDeleted(tripTitle);
  });

  it.skip('edits trip details', () => {
    const originalTitle = 'Edit Test Trip';
    const originalLocation = 'Original Location';
    const updatedTitle = 'Updated Trip Name';
    const updatedLocation = 'Updated Location';

    // Create trip
    tripsPage.clickAddNewTrip();
    tripsPage.fillTripDetails(originalTitle, originalLocation, '');
    tripsPage.clickAddTrip();

    // Click edit button
    tripsPage.clickEditTrip(originalTitle);

    // Update trip
    tripsPage.updateTripDetails(originalTitle, updatedTitle, originalLocation, updatedLocation);

    // Verify update
    tripsPage.verifyTripExists(updatedTitle);
    tripsPage.verifyElementExists(updatedLocation);

    // Cleanup
    tripsPage.deleteTrip(updatedTitle);
  });

  it('navigates back to dashboard', () => {
    tripsPage.clickBackToDashboard();
    tripsPage.verifyUrlContains('/dashboard');
  });
});
