import { BasePage } from './BasePage';

/**
 * Family Tree Page Object
 * Contains all locators and methods for the Family Tree page
 */
export class FamilyTreePage extends BasePage {
  // Locators
  private readonly addFamilyMemberButton = 'button';
  private readonly firstNameInput = 'input[placeholder="John"]';
  private readonly lastNameInput = 'input[placeholder="Doe"]';
  private readonly birthPlaceInput = 'input[placeholder="City, Country"]';
  private readonly genderSelect = 'select';
  private readonly fileInput = 'input[type="file"]';
  private readonly addMemberButton = 'button';
  private readonly updateMemberButton = 'button';
  private readonly treeViewButton = '🌳 Tree';
  private readonly listViewButton = '📋 List';
  private readonly backToDashboardButton = 'Back to Dashboard';

  /**
   * Navigate to Family Tree page from dashboard
   */
  navigateToFamilyTree(): void {
    this.clickByText('Family Tree');
    this.verifyElementExists('Family Tree', { timeout: 10000 });
  }

  /**
   * Verify all page elements exist
   */
  verifyPageElements(): void {
    this.verifyElementExists(this.backToDashboardButton);
    this.verifyElementExists('Family Tree');
    this.verifyElementExists('Member'); // Button text includes "Add Member"
    this.verifyElementExists(this.treeViewButton);
    this.verifyElementExists(this.listViewButton);
  }

  /**
   * Switch to List View
   */
  switchToListView(): void {
    this.clickByText(this.listViewButton);
    this.wait(500);
  }

  /**
   * Switch to Tree View
   */
  switchToTreeView(): void {
    this.clickByText(this.treeViewButton);
    this.wait(500);
  }

  /**
   * Click Add Family Member button
   */
  clickAddFamilyMember(): void {
    cy.contains('button', 'Member').click();
    this.verifyElementExists('Add New Family Member');
  }

  /**
   * Fill member details
   */
  fillMemberDetails(firstName: string, lastName: string, birthPlace: string, gender: string): void {
    cy.get(this.firstNameInput).type(firstName);
    cy.get(this.lastNameInput).type(lastName);
    if (birthPlace) {
      cy.get(this.birthPlaceInput).type(birthPlace);
    }
    cy.get(this.genderSelect).first().select(gender);
  }

  /**
   * Upload profile photo
   */
  uploadProfilePhoto(filePath: string): void {
    cy.get(this.fileInput).selectFile(filePath, { force: true });
    this.wait(3000);
  }

  /**
   * Click Add Member button
   */
  clickAddMember(): void {
    cy.contains(this.addMemberButton, 'Add Member').click({ force: true });
    this.wait(8000); // Wait for member to be added
    this.reload();
    this.wait(2000); // Wait after reload
  }

  /**
   * Create a new family member
   */
  createFamilyMember(
    firstName: string,
    lastName: string,
    birthPlace: string,
    gender: string,
    photoPath?: string
  ): void {
    this.clickAddFamilyMember();
    this.fillMemberDetails(firstName, lastName, birthPlace, gender);
    if (photoPath) {
      this.uploadProfilePhoto(photoPath);
    }
    this.clickAddMember();
  }

  /**
   * Click on family member by name
   */
  clickMemberByName(fullName: string): void {
    cy.contains(fullName, { timeout: 10000 }).click();
  }

  /**
   * Verify profile photo exists
   */
  verifyProfilePhotoExists(fullName: string): void {
    cy.get(`img[alt="${fullName}"]`).should('exist');
  }

  /**
   * Close modal
   */
  closeModal(): void {
    cy.get('body').type('{esc}');
  }

  /**
   * Click edit button for member
   */
  clickEditMember(fullName: string): void {
    cy.contains(fullName, { timeout: 10000 })
      .parent()
      .parent()
      .parent()
      .parent()
      .find('button')
      .eq(1)
      .click();
  }

  /**
   * Update member details
   */
  updateMemberDetails(oldFirstName: string, newFirstName: string, newBirthPlace?: string): void {
    cy.get(`input[value="${oldFirstName}"]`).clear().type(newFirstName);
    if (newBirthPlace) {
      cy.get(this.birthPlaceInput).type(newBirthPlace);
    }
    cy.contains(this.updateMemberButton, 'Update Member').click();
    this.wait(3000); // Wait for update to complete
  }

  /**
   * Delete family member
   */
  deleteMember(fullName: string): void {
    cy.contains(fullName, { timeout: 10000 })
      .parent()
      .parent()
      .parent()
      .find('button')
      .first()
      .click();
    this.autoConfirmDialog();
    this.wait(2000);
  }

  /**
   * Verify member exists
   */
  verifyMemberExists(fullName: string): void {
    this.verifyElementExists(fullName, { timeout: 10000 });
  }

  /**
   * Verify member does not exist
   */
  verifyMemberDeleted(fullName: string): void {
    this.verifyElementNotExists(fullName);
  }

  /**
   * Click Back to Dashboard
   */
  clickBackToDashboard(): void {
    this.clickByText(this.backToDashboardButton);
  }
}
