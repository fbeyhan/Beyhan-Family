# Cypress Testing Setup for Personal Finance Feature

## Overview

Comprehensive Cypress end-to-end tests have been created for all personal finance features with admin and non-admin access controls.

## Test Coverage

### 1. **Finance Dashboard Tests** (`finance.cy.ts`)
- ✅ Admin user sees Personal Finance card on main dashboard
- ✅ Non-admin user does NOT see Personal Finance card
- ✅ Admin can access finance dashboard
- ✅ Non-admin is redirected from finance pages
- ✅ All overview stats display correctly
- ✅ Navigation to all sub-pages works

### 2. **Add Transaction Tests** (`financeAdd.cy.ts`)
- ✅ Page displays all form elements
- ✅ Type switching (expense/income)
- ✅ Adding expense transactions
- ✅ Adding income transactions
- ✅ Multiple rapid transaction entries
- ✅ Merchant and payment method fields
- ✅ Form validation
- ✅ Success messages and form clearing

### 3. **Transaction History Tests** (`financeTransactions.cy.ts`)
- ✅ Page displays filter controls
- ✅ Transactions display in list
- ✅ Filter by type (expense/income/all)
- ✅ Filter by category
- ✅ Filter by date range
- ✅ Search functionality
- ✅ Delete transactions
- ✅ Empty state display
- ✅ **Edit button visibility**
- ✅ **Open inline edit form**
- ✅ **Edit form displays current values**
- ✅ **Cancel edit without saving changes**
- ✅ **Edit transaction amount**
- ✅ **Edit transaction merchant**
- ✅ **Edit transaction payment method**
- ✅ **Edit transaction description**
- ✅ **Edit transaction date with Timestamp conversion**
- ✅ **Edit multiple fields simultaneously**
- ✅ **Verify changes persist after save**

### 4. **Assets Tracking Tests** (`financeAssets.cy.ts`)
- ✅ Add asset form display
- ✅ Add retirement accounts
- ✅ Add investment accounts
- ✅ Add savings accounts
- ✅ Net worth calculation
- ✅ Edit existing assets
- ✅ Delete assets
- ✅ Form validation

### 5. **Reports & Analytics Tests** (`financeReports.cy.ts`)
- ✅ Summary cards display
- ✅ Month selector functionality
- ✅ Expenses by category chart
- ✅ Top 5 categories display
- ✅ Monthly trend charts
- ✅ Net income trend
- ✅ CSV export functionality
- ✅ Surplus/deficit indicators

## Page Objects Created

Following the existing pattern, all page objects extend `BasePage`:

- `FinancePage.ts` - Finance dashboard interactions
- `FinanceAddPage.ts` - Transaction entry form
- `FinanceTransactionsPage.ts` - Transaction history
- `FinanceAssetsPage.ts` - Assets tracking
- `FinanceReportsPage.ts` - Reports and analytics

## Local Testing

### Run all tests:
```bash
npm run cypress:open
```

### Run headless:
```bash
npm run cypress:run
```

### Run specific test file:
```bash
npx cypress run --spec "cypress/e2e/finance.cy.ts"
```

## GitHub Secrets Configuration

**⚠️ REQUIRED:** Add these secrets to your GitHub repository for CI/CD to work:

### Go to: Repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `ADMIN_EMAIL` | `fbeyhan@gmail.com` | Admin user email for finance tests |
| `ADMIN_PASSWORD` | `[your-password]` | Admin user password |
| `VITE_ADMIN_EMAIL` | `fbeyhan@gmail.com` | Admin email for app runtime |

**Note:** `TEST_EMAIL` and `TEST_PASSWORD` already exist for non-admin user tests.

## Security Best Practices

✅ **Secrets are protected:**
- Admin credentials only in `cypress.env.json` (gitignored)
- GitHub Actions uses GitHub Secrets
- No hardcoded passwords in test files
- All secrets injected at runtime

✅ **Two-tier testing:**
- Admin tests use `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Non-admin tests use `TEST_EMAIL` and `TEST_PASSWORD`
- Validates proper access controls

## CI/CD Integration

Tests automatically run on every push to `main` branch:

1. **Test Job** - Runs all Cypress tests including finance tests
2. **Build Job** - Only runs if tests pass
3. **Deploy Job** - Only runs if build succeeds

## Test Data Cleanup

Tests create temporary data during execution:
- Transactions are created and may be deleted during tests
- Assets are created and may be deleted during tests
- Consider periodic manual cleanup of test data in Firestore

## Troubleshooting

### Tests fail locally:
1. Ensure `cypress.env.json` has correct credentials
2. Ensure Firestore rules are published with admin email
3. Ensure `.env` has `VITE_ADMIN_EMAIL` set
4. Run `npm run dev` to verify app works manually first

### Tests fail in CI/CD:
1. Verify all GitHub Secrets are set correctly
2. Check GitHub Actions logs for specific errors
3. Ensure Firestore rules match production

## Test Execution Order

Tests are independent and can run in any order. However, some tests create data:
- `financeAdd.cy.ts` creates transactions
- `financeTransactions.cy.ts` creates, edits, and deletes transactions
- `financeAssets.cy.ts` creates and deletes assets
- `financeReports.cy.ts` uses existing transaction data

## Recent Updates

### December 18, 2025 - Transaction Edit Functionality

**New Features Added:**
- Inline edit form for transactions
- Edit button next to Delete button
- Editable fields: Date, Amount, Merchant, Payment Method, Description
- Save Changes and Cancel buttons
- Proper Firestore Timestamp conversion for date handling
- Real-time UI updates after edits
- Compatible with existing data (handles both Timestamp and string dates)

**New Tests Added (10 tests):**
1. Verify edit button exists on transactions
2. Open edit form when clicking edit button
3. Edit form displays current transaction values
4. Cancel edit without saving changes
5. Edit transaction amount and save
6. Edit transaction merchant and save
7. Edit transaction payment method and save
8. Edit transaction description and save
9. Edit transaction date and save
10. Edit multiple fields simultaneously and verify all changes

**Page Object Methods Added:**
- `verifyEditButtonExists()`
- `clickEditFirstTransaction()`
- `verifyEditFormVisible()`
- `verifyEditFormContainsValue(value)`
- `editAmount(newAmount)`
- `editMerchant(newMerchant)`
- `editPaymentMethod(newPaymentMethod)`
- `editDescription(newDescription)`
- `editDate(newDate)`
- `clickSaveEdit()`
- `clickCancelEdit()`

**Technical Implementation:**
- State management with `editingId` and `editForm`
- Handler functions: `handleEdit()`, `handleCancelEdit()`, `handleSaveEdit()`
- Timestamp conversion: `Timestamp.fromDate(new Date(date + 'T00:00:00'))`
- Local state update after Firestore save
- Backward compatible date handling for existing data

## Test Statistics

**Total Finance Tests: 82**
- Finance Dashboard: 10 tests
- Add Transaction: 11 tests
- Transaction History: 23 tests (13 original + 10 edit tests)
- Assets Tracking: 15 tests
- Reports & Analytics: 13 tests

**Total Project Tests: 124+**
- Authentication: 8 tests
- Dashboard: 7 tests
- Family Tree: 12 tests
- Trips: 11 tests
- Family Pictures: 6 tests
- Change Password: 8 tests
- Finance Module: 82 tests

## Coverage Summary

**Total Test Cases: 60+**
- Finance Dashboard: 10 tests
- Add Transaction: 11 tests
- Transaction History: 13 tests
- Assets Tracking: 15 tests
- Reports & Analytics: 13 tests

All tests validate both happy paths and edge cases, admin vs non-admin access, and proper error handling.
