# Beyhan Family Website

A modern, secure family website built with React, TypeScript, Firebase Authentication, and styled with Tailwind CSS. This project serves as both a functional family portal and a learning platform for modern web development practices.

## Table of Contents
- [Project Overview](#project-overview)
- [Complete Development Guide](#complete-development-guide)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [Personal Finance Tracking](#personal-finance-tracking)
- [Cypress Testing](#cypress-testing)
- [Deployment](#deployment)

---

## Project Overview

**Tech Stack:**
- **React 18** - UI library for building component-based interfaces
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Firebase** - Authentication, Firestore database, and Storage
- **React Router** - Client-side routing
- **Cypress 12** - End-to-end testing framework with TypeScript support
- **GitHub Pages** - Deployment platform with automated CI/CD

---

## Complete Development Guide

This section provides a comprehensive, step-by-step walkthrough of how this project was built from scratch.

### Phase 1: Initial Setup & Environment Configuration

#### Step 1: Install Node.js and Package Manager
```bash
# Download and install Node.js (v18 or higher) from nodejs.org
# This includes npm (Node Package Manager) automatically

# Verify installation
node --version   # Should show v18.x.x or higher
npm --version    # Should show 8.x.x or higher
```

**What this does:** Node.js is the runtime environment that allows JavaScript to run outside the browser. npm is used to install project dependencies.

#### Step 2: Create Project with Vite
```bash
# Create new React + TypeScript project using Vite
npm create vite@latest beyhan-family -- --template react-ts

# Navigate into project directory
cd beyhan-family

# Install initial dependencies
npm install
```

**What this creates:**
- `package.json` - Lists all project dependencies and npm scripts
- `tsconfig.json` - TypeScript compiler configuration
- `vite.config.ts` - Vite build tool configuration
- `index.html` - Entry HTML file
- `src/` - Source code directory with initial React setup

**Files created at this stage:**
- `package.json` - Defines project metadata and dependencies
- `index.html` - Root HTML file that loads the React app
- `src/main.tsx` - Application entry point that mounts React
- `src/App.tsx` - Root React component
- `vite.config.ts` - Vite bundler configuration

#### Step 3: Install Tailwind CSS
```bash
# Install Tailwind CSS and its peer dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind configuration
npx tailwindcss init -p
```

**What this creates:**
- `tailwind.config.cjs` - Tailwind CSS configuration file
- `postcss.config.cjs` - PostCSS configuration for processing CSS

**Configure Tailwind** - Edit `tailwind.config.cjs`:
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Add Tailwind directives** - Edit `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Purpose:** Tailwind CSS provides utility classes for styling without writing custom CSS.

#### Step 4: Install React Router
```bash
npm install react-router-dom
```

**What this enables:** Client-side routing to navigate between different pages without full page reloads (e.g., /login, /dashboard, /family-pictures).

#### Step 5: Install Firebase
```bash
npm install firebase
```

**What this enables:** Authentication, database (Firestore), and hosting capabilities through Google's Firebase platform.

#### Step 6: Install Cypress for Testing
```bash
npm install -D cypress start-server-and-test wait-on
```

**What this creates:**
- `cypress/` - Directory containing all test files
- `cypress.config.js` - Cypress testing configuration

```bash
# Initialize Cypress (creates folder structure)
npx cypress open
```

**Cypress folder structure:**
- `cypress/e2e/` - Contains end-to-end test files (TypeScript)
- `cypress/support/` - Custom commands and configuration
- `cypress/support/pages/` - Page Object Model classes
- `cypress/support/helpers/` - Test helper utilities
- `cypress/fixtures/` - Test data files

**Page Object Model (POM) Implementation:**
This project uses the Page Object Model pattern for maintainable, scalable test automation:
- **BasePage.ts** - Foundation class with common methods for all pages
- **LoginPage.ts** - Login page interactions and validations
- **DashboardPage.ts** - Dashboard navigation and element interactions
- **FamilyTreePage.ts** - Family tree page objects and actions
- **TripsPage.ts** - Trips page interactions
- **FamilyPicturesPage.ts** - Family pictures gallery interactions
- **ChangePasswordPage.ts** - Password change form interactions
- **auth.helper.ts** - Reusable authentication helper functions

Each page object encapsulates:
- Element selectors (locators)
- Page-specific actions
- Validation methods
- Navigation logic

---

### Phase 2: Project Structure Setup

#### Step 1: Create Directory Structure
```bash
mkdir src/components
mkdir src/pages
mkdir src/context
mkdir src/config
```

**Directory purposes:**
- `src/components/` - Reusable React components used across multiple pages
- `src/pages/` - Full page components (Login, Dashboard, etc.)
- `src/context/` - React Context for global state management
- `src/config/` - Configuration files (Firebase setup)

---

### Phase 3: Core Application Files

#### Configuration Files

**File: `src/config/firebase.ts`**
- **Purpose:** Initialize Firebase SDK and export authentication instance
- **Used by:** AuthContext for login/logout operations
- **What it does:** Connects your app to Firebase services using API keys

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

**Environment variables** - Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

#### Context (Global State Management)

**File: `src/context/AuthContext.tsx`**
- **Purpose:** Manages authentication state globally across the entire app
- **Used by:** All pages and components that need auth status
- **Features:**
  - Tracks if user is logged in (`isAuthenticated`)
  - Stores user information (`user` object)
  - Provides login/logout functions
  - Auto-logout after 20 minutes of inactivity
  - Loading state during authentication checks

**Key concepts:**
- React Context API provides global state without prop drilling
- `onAuthStateChanged` listens for Firebase auth changes
- Inactivity timer resets on user interaction (mouse, keyboard, scroll)

---

#### Components

**File: `src/components/ProtectedRoute.tsx`**
- **Purpose:** Security wrapper that prevents unauthorized access to protected pages
- **Used by:** Dashboard, FamilyPictures, Trips, FamilyTree, ChangePassword
- **How it works:**
  1. Checks if user is authenticated
  2. If yes → renders the protected page
  3. If no → redirects to login page

```typescript
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}
```

---

#### Pages

**File: `src/pages/Login.tsx`**
- **Purpose:** Login form for user authentication
- **Tied to:** `/login` route
- **Features:**
  - Email and password input fields
  - Form validation
  - Error messages for failed login
  - Redirects to dashboard on success
- **Uses:** `AuthContext.login()` function

**File: `src/pages/Dashboard.tsx`**
- **Purpose:** Main landing page after login - hub for navigation
- **Tied to:** `/dashboard` route
- **Features:**
  - Welcome message with user's email
  - Menu cards linking to:
    - Family Pictures
    - Trips
    - Family Tree
  - Change Password button
  - Logout button
- **Uses:** `AuthContext.user` and `AuthContext.logout()`

**File: `src/pages/FamilyPictures.tsx`**
- **Purpose:** Gallery page for family photos
- **Tied to:** `/family-pictures` route
- **Features:**
  - Grid layout for photo display
  - Back to dashboard button
- **Protected:** Requires authentication

**File: `src/pages/Trips.tsx`**
- **Purpose:** Manage and display family trip information and memories
- **Tied to:** `/trips` route
- **Features:**
  - Add/edit/delete trip entries
  - Trip photo uploads (multiple images per trip)
  - Firebase Firestore for trip data
  - Firebase Storage for trip photos
  - Date range picker (start/end dates)
  - Location tracking
  - Descriptions and highlights
  - Photo gallery for each trip
  - Timezone-consistent date handling
  - Responsive card layout
- **Protected:** Requires authentication

**File: `src/pages/FamilyTree.tsx`**
- **Purpose:** Comprehensive family tree management with CRUD operations
- **Tied to:** `/family-tree` route
- **Features:**
  - Add/edit/delete family members with full details
  - Profile picture upload with circular crop tool
  - Firebase Firestore integration for data persistence
  - Firebase Storage for profile photos
  - View modes: Tree visualization and list view
  - Duplicate detection system
  - Relationship tracking (parents, spouses)
  - Biography and life events (birth, death dates)
  - Responsive mobile design
  - Timezone-consistent date handling
- **Technical Details:**
  - Real-time data sync with Firestore
  - Image optimization and cropping
  - Form validation
  - Loading states and error handling
- **Protected:** Requires authentication

**File: `src/pages/ChangePassword.tsx`**
- **Purpose:** Allow users to update their password
- **Tied to:** `/change-password` route
- **Features:**
  - Current password field
  - New password field
  - Confirmation field
  - Password validation
  - Success/error messages
- **Protected:** Requires authentication

---

#### Root Application

**File: `src/App.tsx`**
- **Purpose:** Root component that defines all routes and wraps app with providers
- **Routes configuration:**
  - `/` → Redirects to `/login`
  - `/login` → Login page (public)
  - `/dashboard` → Dashboard (protected)
  - `/family-pictures` → Family Pictures (protected)
  - `/trips` → Trips (protected)
  - `/family-tree` → Family Tree (protected)
  - `/change-password` → Change Password (protected)

**Structure:**
```typescript
<AuthProvider>              {/* Global auth state */}
  <BrowserRouter>           {/* Enables routing */}
    <Routes>                {/* Route definitions */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>    {/* Auth guard */}
          <Dashboard />
        </ProtectedRoute>
      } />
      {/* ... other routes */}
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

**File: `src/main.tsx`**
- **Purpose:** Application entry point - mounts React to DOM
- **What it does:**
  1. Imports root styles (`styles.css`)
  2. Renders `<App />` component into `#root` div in index.html

---

### Phase 4: Testing Setup with Page Object Model

**Test Architecture:**
This project implements a comprehensive E2E testing strategy using Cypress with TypeScript and the Page Object Model pattern for better maintainability and scalability.

**File: `cypress/support/pages/BasePage.ts`**
- **Purpose:** Foundation class providing common methods for all page objects
- **Key Methods:**
  - `visit(path)` - Navigate to a specific page
  - `getElement(selector)` - Find elements with wait strategy
  - `clickByText(text)` - Click elements containing specific text
  - `verifyElementExists(selector)` - Assert element presence
  - `clearStorage()` - Clean localStorage/sessionStorage
  - `autoConfirmDialog()` - Auto-accept browser dialogs

**Individual Page Objects:**

**`cypress/support/pages/LoginPage.ts`**
- Email/password input methods
- Login form submission
- Error message validation
- Success navigation verification

**`cypress/support/pages/DashboardPage.ts`**
- Navigation to different sections (Trips, Family Tree, Family Pictures)
- Change password link interaction
- Logout functionality
- Dashboard element verification

**`cypress/support/pages/FamilyTreePage.ts`**
- Add family member workflow
- Profile photo upload
- Form field interactions
- View mode switching (tree/list)
- Member card validation

**`cypress/support/pages/TripsPage.ts`**
- Add new trip functionality
- Trip photo upload
- Date picker interactions
- Trip card validation

**`cypress/support/pages/FamilyPicturesPage.ts`**
- Photo upload functionality
- Gallery view validation
- Photo management operations

**`cypress/support/pages/ChangePasswordPage.ts`**
- Current password input
- New password validation
- Password confirmation
- Success/error message handling

**File: `cypress/support/helpers/auth.helper.ts`**
- **Purpose:** Reusable authentication utilities
- **Functions:**
  - `loginViaUI()` - Full login workflow through UI
  - `clearAuth()` - Clean authentication state
  - Helper functions for common auth operations

**Test Files (TypeScript):**
- `cypress/e2e/login.cy.ts` - Login functionality tests
- `cypress/e2e/dashboard.cy.ts` - Dashboard navigation tests
- `cypress/e2e/familyTree.cy.ts` - Family tree CRUD operations
- `cypress/e2e/trips.cy.ts` - Trips management tests
- `cypress/e2e/familyPictures.cy.ts` - Photo gallery tests
- `cypress/e2e/changePassword.cy.ts` - Password change tests

**Test Coverage:**
- ✅ Authentication flows (login, logout, session management)
- ✅ Protected route access control
- ✅ Form validations and error handling
- ✅ Navigation between pages
- ✅ CRUD operations for family data
- ✅ File uploads (photos, profile pictures)
- ✅ Responsive design elements
- ✅ Date handling and timezone consistency

**Cypress Configuration:**
The `cypress.config.js` file defines the `baseUrl` as `https://beyhanfamily.com`. This allows all test navigation methods to use relative paths. For example:
- When `cy.visit('/')` is called in tests, Cypress automatically prepends the `baseUrl`
- This makes tests portable and easier to switch between environments
- The `LoginPage.visitLoginPage()` method calls `this.visit('/')`, which internally uses `cy.visit('/')` and navigates to `https://beyhanfamily.com/`

**Environment Variables & Secrets Management:**
Sensitive test credentials are stored securely using Cypress environment variables:

**Local Development:**
- Create `cypress.env.json` file in project root (already gitignored):
```json
{
  "TEST_EMAIL": "your-test-email@example.com",
  "TEST_PASSWORD": "your-test-password"
}
```
- Access in tests: `Cypress.env('TEST_EMAIL')` and `Cypress.env('TEST_PASSWORD')`
- This file is **never committed** to version control (included in `.gitignore`)

**CI/CD (GitHub Actions):**
- Add repository secrets in **Settings** → **Secrets and variables** → **Actions**:
  - `TEST_EMAIL` - Test account email
  - `TEST_PASSWORD` - Test account password
- Update `.github/workflows/deploy.yml` to include environment variables in the test job:
```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  # ... other Firebase secrets
  CYPRESS_TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
  CYPRESS_TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```
- Cypress automatically reads `CYPRESS_` prefixed environment variables and makes them available via `Cypress.env()`
- **Important:** Without these environment variables in the workflow, tests will fail with `undefined` values

**Running tests:**
```bash
npm run cypress:open              # Interactive mode with GUI
npm run cypress:run               # Headless mode for CI/CD
npx cypress run --spec "cypress/e2e/login.cy.ts"  # Run specific test
```

**CI/CD Integration:**
Tests run automatically on every push via GitHub Actions before deployment.

---

### Phase 5: Build Configuration

**File: `vite.config.ts`**
- **Purpose:** Configure Vite build settings
- **Key settings:**
  - React plugin for JSX/TSX support
  - Build output directory
  - Development server port
  - Environment variable handling

**File: `tsconfig.json`**
- **Purpose:** TypeScript compiler options
- **Key settings:**
  - Target ES version
  - Module resolution strategy
  - Strict type checking enabled
  - JSX compilation for React

**File: `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",                    // Start dev server at localhost:5173
    "build": "vite build",            // Create production build in dist/
    "preview": "vite preview",        // Preview production build locally
    "cypress:open": "cypress open",   // Open Cypress test GUI
    "cypress:run": "cypress run"      // Run Cypress tests in terminal
  }
}
```

---

### Phase 6: Styling with Tailwind CSS

**Styling approach:**
- Utility-first CSS using Tailwind classes directly in JSX
- Responsive design with mobile-first breakpoints (`md:`, `lg:`)
- Custom color schemes using Tailwind's color palette
- Gradient backgrounds (`bg-gradient-to-br`)
- Hover effects and transitions
- Custom fonts loaded from Google Fonts (Poppins)

**Example styling pattern:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
  <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 
    hover:from-amber-600 hover:to-orange-600 text-white font-semibold 
    rounded-xl transition-all duration-300 transform hover:scale-105">
    Click Me
  </button>
</div>
```

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project created (for authentication)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd beyhan-family
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Firebase:**
Create a `.env` file in the root directory:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Run development server:**
```bash
npm run dev
```
Visit `http://localhost:5173`

5. **Run tests (optional):**
```bash
npm run cypress:open
```

---

## Project Structure

```
beyhan-family/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD pipeline
├── public/               # Static assets
│   └── _redirects       # SPA routing redirects
├── src/
│   ├── components/      # Reusable components
│   │   └── ProtectedRoute.tsx    # Auth guard for private routes
│   ├── config/          # Configuration files
│   │   └── firebase.ts           # Firebase initialization (Auth, Firestore, Storage)
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── pages/           # Page components
│   │   ├── Login.tsx             # Login page (/)
│   │   ├── Dashboard.tsx         # Main dashboard (/dashboard)
│   │   ├── FamilyPictures.tsx    # Photo gallery (/family-pictures)
│   │   ├── Trips.tsx             # Family trips with photos (/trips)
│   │   ├── FamilyTree.tsx        # Family tree CRUD (/family-tree)
│   │   └── ChangePassword.tsx    # Password change (/change-password)
│   ├── utils/           # Utility functions
│   │   └── checkDuplicates.ts    # Duplicate detection logic
│   ├── App.tsx          # Root component with routing
│   ├── main.tsx         # Application entry point
│   └── styles.css       # Global styles with Tailwind
├── cypress/             # E2E tests (TypeScript)
│   ├── e2e/             # Test files
│   │   ├── login.cy.ts           # Login tests
│   │   ├── dashboard.cy.ts       # Dashboard tests
│   │   ├── familyTree.cy.ts      # Family tree tests
│   │   ├── trips.cy.ts           # Trips tests
│   │   ├── familyPictures.cy.ts  # Photo gallery tests
│   │   └── changePassword.cy.ts  # Password change tests
│   ├── support/         # Cypress configuration
│   │   ├── pages/       # Page Object Model
│   │   │   ├── BasePage.ts          # Base page class
│   │   │   ├── LoginPage.ts         # Login page object
│   │   │   ├── DashboardPage.ts     # Dashboard page object
│   │   │   ├── FamilyTreePage.ts    # Family tree page object
│   │   │   ├── TripsPage.ts         # Trips page object
│   │   │   ├── FamilyPicturesPage.ts# Pictures page object
│   │   │   └── ChangePasswordPage.ts# Password page object
│   │   ├── helpers/
│   │   │   └── auth.helper.ts    # Auth helper functions
│   │   ├── commands.js           # Custom Cypress commands
│   │   ├── e2e.js               # E2E configuration
│   │   └── index.ts             # Central export file
│   ├── fixtures/        # Test data files
│   ├── downloads/       # Test download directory
│   ├── screenshots/     # Failed test screenshots
│   ├── videos/          # Test execution recordings
│   └── tsconfig.json    # TypeScript config for Cypress
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.cjs  # Tailwind CSS configuration
├── postcss.config.cjs   # PostCSS configuration
├── cypress.config.js    # Cypress test configuration
├── CNAME                # Custom domain configuration
├── DEPLOYMENT.md        # Deployment documentation
├── FIREBASE_SETUP.md    # Firebase setup guide
└── FIRESTORE_RULES.md   # Firestore security rules
```

---

## Features

### Authentication & Security
- ✅ Firebase email/password authentication
- ✅ Protected routes with automatic redirect to login
- ✅ Auto-logout after 20 minutes of inactivity
- ✅ Password change functionality with validation
- ✅ Persistent sessions across page refreshes
- ✅ Firestore security rules for data protection

### User Interface
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Modern gradient color schemes with Tailwind CSS
- ✅ Smooth animations and transitions
- ✅ Clean, intuitive navigation with breadcrumbs
- ✅ Mobile-optimized header and buttons
- ✅ Touch-friendly interactions

### Family Tree Management
- ✅ Add/edit/delete family members
- ✅ Profile photo upload with circular crop tool
- ✅ Parent-child relationship tracking
- ✅ Spouse relationships
- ✅ Birth/death date tracking with timezone handling
- ✅ Biography and life events
- ✅ Place of birth information
- ✅ Gender selection
- ✅ Display order customization
- ✅ Duplicate member detection
- ✅ Tree view and list view modes
- ✅ Real-time data synchronization

### Trips Management
- ✅ Add/edit/delete trip entries
- ✅ Multiple photo uploads per trip
- ✅ Date range tracking (start/end dates)
- ✅ Location information
- ✅ Trip descriptions and highlights
- ✅ Photo gallery with Firebase Storage
- ✅ Timezone-consistent date handling

### Family Pictures Gallery
- ✅ Photo upload and management
- ✅ Grid layout gallery view
- ✅ Firebase Storage integration
- ✅ Image optimization

### Personal Finance Tracking (Admin-Only)
- ✅ Admin-only access control via environment variables
- ✅ Transaction management (income/expenses)
- ✅ 14 expense categories + 4 income categories with subcategories
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Edit functionality with inline form (date, amount, merchant, payment method, description)
- ✅ Asset/investment tracking with net worth calculations
- ✅ Transaction filtering (type, category, date range, search)
- ✅ Reports & analytics with interactive charts (recharts library)
- ✅ Monthly expense/income analysis
- ✅ Net income trend visualization
- ✅ CSV export functionality
- ✅ Eastern US timezone handling for accurate date entry
- ✅ Mobile-optimized transaction entry form
- ✅ Real-time statistics dashboard

### Testing & Quality Assurance
- ✅ Comprehensive E2E test suite with Cypress
- ✅ Page Object Model pattern for maintainable tests
- ✅ TypeScript support in tests
- ✅ Automated CI/CD testing before deployment
- ✅ 90+ passing tests across all features
- ✅ Screenshot and video recording on failures
- ✅ Complete finance feature test coverage (60+ tests)
- ✅ Transaction edit functionality tests (10 new tests)

### Deployment & DevOps
- ✅ GitHub Actions CI/CD pipeline
- ✅ Automated testing on every commit
- ✅ GitHub Pages hosting
- ✅ Custom domain support (beyhanfamily.com)
- ✅ Environment variable management
- ✅ Production build optimization

---

## Personal Finance Tracking

### Overview
The Personal Finance module is an admin-only feature that provides comprehensive expense tracking, income management, and financial analytics. Access is controlled via environment variables, ensuring only designated administrators can view and manage financial data.

### Architecture & Security

**Admin Access Control:**
```typescript
// Environment variable defines admin email
VITE_ADMIN_EMAIL=fbeyhan@gmail.com

// Admin check utility (src/utils/adminAuth.ts)
export const isAdmin = (userEmail: string | null): boolean => {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  return userEmail === adminEmail;
};

// Protected route with admin verification
{currentUser && isAdmin(currentUser.email) && (
  <Route path="/finance" element={<Finance />} />
)}
```

**Firestore Security Rules:**
```javascript
// Only admin can access finance collections
match /transactions/{transactionId} {
  allow read, write: if request.auth.uid != null 
    && request.auth.token.email == "fbeyhan@gmail.com";
}

match /assets/{assetId} {
  allow read, write: if request.auth.uid != null 
    && request.auth.token.email == "fbeyhan@gmail.com";
}
```

### Features

#### 1. **Finance Dashboard** ([Finance.tsx](src/pages/Finance.tsx))
Main hub showing real-time financial overview:
- Monthly expenses summary with color-coded card
- Monthly income summary
- Net income calculation (income - expenses)
- Total net worth from all assets
- Navigation cards to all finance sub-pages
- Responsive grid layout

#### 2. **Add Transaction** ([FinanceAdd.tsx](src/pages/FinanceAdd.tsx))
Mobile-optimized quick transaction entry:
- Type toggle: Expense vs Income
- 14 expense categories with subcategories:
  - Food (Groceries, Restaurants, Coffee Shops)
  - Transportation (Gas, Public Transit, Uber/Lyft, Car Maintenance)
  - Housing (Rent/Mortgage, Utilities, Internet, Repairs)
  - Healthcare (Doctor, Pharmacy, Insurance)
  - Entertainment (Movies, Concerts, Subscriptions)
  - Shopping (Clothes, Electronics, Home Goods)
  - Personal Care (Haircut, Gym, Spa)
  - Education (Tuition, Books, Courses)
  - Travel (Flights, Hotels, Activities)
  - Bills (Phone, Insurance, Loans)
  - Gifts (Birthday, Holiday, Charity)
  - Pets (Food, Vet, Supplies)
  - Kids (Daycare, Activities, School)
  - Other
- 4 income categories with subcategories:
  - Salary (Paycheck, Bonus)
  - Investment (Dividends, Capital Gains, Interest)
  - Business (Sales, Services)
  - Other
- Date picker with Eastern US timezone handling
- Amount input with dollar sign prefix
- Merchant/vendor field
- Payment method (Credit Card, Debit Card, Cash, etc.)
- Description field for additional details
- Success message with automatic form reset

**Timezone Handling:**
```typescript
// Eastern timezone date helper
const getTodayInEastern = (): string => {
  const today = new Date();
  const easternDate = new Date(today.toLocaleString('en-US', { 
    timeZone: 'America/New_York' 
  }));
  return easternDate.toISOString().split('T')[0];
};
```

#### 3. **Transaction History** ([FinanceTransactions.tsx](src/pages/FinanceTransactions.tsx))
Comprehensive transaction management with filtering:
- **View Transactions:**
  - Card-based layout with color-coded type badges
  - Display: date, category, subcategory, merchant, payment method
  - Amount with color coding (red for expenses, green for income)
  - Net total calculation at top

- **Filter Options:**
  - By type (All, Expense, Income)
  - By category (All Categories + specific categories)
  - By date range (All Time, Today, This Week, This Month, This Year)
  - Search by description, category, or merchant

- **Edit Functionality (NEW):**
  - Click "Edit" button to open inline edit form
  - Editable fields: Date, Amount, Merchant, Payment Method, Description
  - "Save Changes" commits updates to Firestore
  - "Cancel" discards changes and returns to view mode
  - Real-time UI update after save
  - Proper Timestamp conversion for date handling

- **Delete Transactions:**
  - Confirmation dialog before deletion
  - Immediate removal from Firestore and UI

#### 4. **Asset Tracking** ([FinanceAssets.tsx](src/pages/FinanceAssets.tsx))
Investment and retirement account management:
- **Asset Types:**
  - Investment Account (Brokerage, Stocks, ETFs)
  - Retirement Account (401k, IRA, Roth IRA)
  - Savings Account
  - Property (Real Estate)

- **Features:**
  - Add new assets with institution name, account number, balance
  - Edit existing asset balances
  - Delete assets with confirmation
  - Net worth calculation (sum of all asset balances)
  - Last updated date tracking
  - Color-coded asset type badges

#### 5. **Reports & Analytics** ([FinanceReports.tsx](src/pages/FinanceReports.tsx))
Visual financial analysis with recharts library:
- **Month Selector:** Analyze any month from dropdown
- **Summary Cards:**
  - Total expenses for selected month
  - Total income for selected month
  - Net income (income - expenses)
  - Color-coded for positive/negative values

- **Pie Chart:** Expenses by category
  - Interactive hover tooltips
  - Percentage breakdown
  - Color-coded categories

- **Top 5 Categories:** Spending breakdown
  - Bar graphs showing amount per category
  - Percentage of total expenses
  - Sorted by highest spending

- **Bar Chart:** Monthly income vs expenses
  - Side-by-side comparison
  - Last 6 months trend
  - Green for income, red for expenses

- **Line Chart:** Net income trend
  - 6-month historical view
  - Visual trend line showing financial health
  - Tooltip with exact values

- **CSV Export:** Download transaction data for external analysis

### Data Models

**Transaction Interface:**
```typescript
interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  date: Date;  // Stored as Firestore Timestamp
  merchant?: string;
  paymentMethod?: string;
  createdAt: Date;
}
```

**Asset Interface:**
```typescript
interface Asset {
  id: string;
  name: string;
  type: 'investment' | 'retirement' | 'savings' | 'property';
  balance: number;
  institution?: string;
  accountNumber?: string;
  lastUpdated: Date;  // Stored as Firestore Timestamp
}
```

### Development Process

**Phase 1: Planning & Architecture (2 hours)**
- Discussed multiple deployment options
- Selected Option 1: Same domain with admin-only access (free, secure)
- Designed data models and collection structure
- Planned security rules and access control

**Phase 2: Core Implementation (6 hours)**
- Created admin utility function (adminAuth.ts)
- Built Finance dashboard with overview cards
- Implemented FinanceAdd page with category system
- Developed FinanceTransactions with filtering
- Created FinanceAssets for investment tracking
- Built FinanceReports with recharts integration
- Added routing and navigation

**Phase 3: Timezone Bug Fix (1 hour)**
- Discovered date picker showing wrong date (UTC vs Eastern)
- Implemented getTodayInEastern() helper function
- Applied fix to FinanceAdd and FinanceAssets pages
- Verified correct date display

**Phase 4: Edit Functionality (2 hours)**
- Added edit state management (editingId, editForm)
- Implemented inline edit form with all fields
- Created handleEdit, handleSaveEdit, handleCancelEdit functions
- Fixed Timestamp conversion for date editing
- Updated local state after edits

**Phase 5: Testing (4 hours)**
- Created 5 page object classes following existing patterns
- Wrote 60+ comprehensive Cypress tests
- Added tests for dashboard, add, transactions, assets, reports
- Implemented transaction edit tests (10 new tests)
- Verified all tests pass in CI/CD pipeline

**Total Development Time:** ~15 hours

### Usage Instructions

**For Administrators:**
1. Log in with admin email (fbeyhan@gmail.com)
2. Dashboard shows "Personal Finance" card (non-admins don't see this)
3. Click "Personal Finance" to access finance dashboard
4. Use navigation cards to access different sections
5. Add transactions quickly via "Add Transaction" page
6. View and edit history in "Transaction History"
7. Track investments in "My Assets"
8. Analyze spending in "Reports"

**Adding Admin User:**
1. Update `.env` file: `VITE_ADMIN_EMAIL=your-email@example.com`
2. Update Firestore rules with your email
3. Add GitHub Secrets: `VITE_ADMIN_EMAIL`, `CYPRESS_ADMIN_EMAIL`, `CYPRESS_ADMIN_PASSWORD`
4. Rebuild and deploy

---

## Cypress Testing

### Test Architecture

**Page Object Model Pattern:**
All tests follow the Page Object Model (POM) pattern for maintainability and reusability. Page objects encapsulate page-specific logic and element selectors.

**Directory Structure:**
```
cypress/
├── e2e/                                    # Test files
│   ├── login.cy.ts                        # Authentication tests (8 tests)
│   ├── dashboard.cy.ts                    # Dashboard tests (7 tests)
│   ├── familyTree.cy.ts                   # Family tree tests (12 tests)
│   ├── trips.cy.ts                        # Trips tests (11 tests)
│   ├── familyPictures.cy.ts               # Pictures tests (6 tests)
│   ├── changePassword.cy.ts               # Password change tests (8 tests)
│   ├── finance.cy.ts                      # Finance dashboard tests (10 tests)
│   ├── financeAdd.cy.ts                   # Add transaction tests (11 tests)
│   ├── financeTransactions.cy.ts          # Transaction history tests (23 tests)
│   ├── financeAssets.cy.ts                # Asset tracking tests (15 tests)
│   └── financeReports.cy.ts               # Reports tests (13 tests)
├── support/
│   ├── pages/                             # Page Object classes
│   │   ├── BasePage.ts                    # Base class with common methods
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── FamilyTreePage.ts
│   │   ├── TripsPage.ts
│   │   ├── FamilyPicturesPage.ts
│   │   ├── ChangePasswordPage.ts
│   │   ├── FinancePage.ts
│   │   ├── FinanceAddPage.ts
│   │   ├── FinanceTransactionsPage.ts
│   │   ├── FinanceAssetsPage.ts
│   │   └── FinanceReportsPage.ts
│   ├── commands.js                        # Custom Cypress commands
│   └── e2e.js                             # Global test configuration
├── fixtures/                               # Test data files
└── tsconfig.json                          # TypeScript configuration
```

### Test Coverage

**Total Tests: 124+ passing tests**

#### Authentication Tests (login.cy.ts - 8 tests)
- ✅ Display login form elements
- ✅ Successful login with valid credentials
- ✅ Failed login with invalid credentials
- ✅ Password visibility toggle
- ✅ Remember me functionality
- ✅ Form validation
- ✅ Auto-redirect when already authenticated
- ✅ Session persistence

#### Dashboard Tests (dashboard.cy.ts - 7 tests)
- ✅ Display dashboard after login
- ✅ Show all navigation cards
- ✅ Navigate to each feature section
- ✅ Display user greeting
- ✅ Logout functionality
- ✅ Protected route behavior
- ✅ Admin-only finance card visibility

#### Family Tree Tests (familyTree.cy.ts - 12 tests)
- ✅ Display family tree page
- ✅ Add new family member
- ✅ Edit existing member
- ✅ Delete member with confirmation
- ✅ Upload profile photo
- ✅ Set parent relationships
- ✅ Display member details
- ✅ Validation for required fields
- ✅ Date picker functionality
- ✅ Duplicate detection
- ✅ Tree view and list view toggle
- ✅ Real-time updates

#### Trips Tests (trips.cy.ts - 11 tests)
- ✅ Display trips page
- ✅ Add new trip
- ✅ Edit existing trip
- ✅ Delete trip with confirmation
- ✅ Upload multiple photos
- ✅ Date range selection
- ✅ Location input
- ✅ Description and highlights
- ✅ Photo gallery display
- ✅ Form validation
- ✅ Real-time synchronization

#### Family Pictures Tests (familyPictures.cy.ts - 6 tests)
- ✅ Display pictures gallery
- ✅ Upload new picture
- ✅ Delete picture with confirmation
- ✅ Grid layout display
- ✅ Firebase Storage integration
- ✅ Image loading

#### Change Password Tests (changePassword.cy.ts - 8 tests)
- ✅ Display change password form
- ✅ Successfully change password
- ✅ Validation for current password
- ✅ Password strength requirements
- ✅ Password confirmation match
- ✅ Error handling for wrong current password
- ✅ Success message display
- ✅ Form reset after success

#### Finance Dashboard Tests (finance.cy.ts - 10 tests)
- ✅ Admin-only access verification
- ✅ Display finance dashboard elements
- ✅ Monthly expenses card with amount
- ✅ Monthly income card with amount
- ✅ Net income calculation
- ✅ Net worth from assets
- ✅ Navigation to Add Transaction page
- ✅ Navigation to Transaction History page
- ✅ Navigation to My Assets page
- ✅ Navigation to Reports page

#### Add Transaction Tests (financeAdd.cy.ts - 11 tests)
- ✅ Display add transaction form
- ✅ Toggle between expense and income
- ✅ Select expense category and subcategory
- ✅ Select income category and subcategory
- ✅ Enter amount with validation
- ✅ Select date (Eastern timezone)
- ✅ Enter merchant/vendor
- ✅ Select payment method
- ✅ Enter description
- ✅ Successfully submit transaction
- ✅ Form reset after submission

#### Transaction History Tests (financeTransactions.cy.ts - 23 tests)
- ✅ Display transaction history page
- ✅ Show all transactions
- ✅ Filter by type (all, expense, income)
- ✅ Filter by category
- ✅ Filter by date range (today, week, month, year)
- ✅ Search transactions by description
- ✅ Display net total calculation
- ✅ Delete transaction with confirmation
- ✅ Empty state for no transactions
- ✅ Navigate back to finance dashboard
- ✅ **Edit button visibility**
- ✅ **Open inline edit form**
- ✅ **Edit form displays current values**
- ✅ **Cancel edit without saving**
- ✅ **Edit amount and save**
- ✅ **Edit merchant and save**
- ✅ **Edit payment method and save**
- ✅ **Edit description and save**
- ✅ **Edit date and save**
- ✅ **Edit multiple fields simultaneously**
- ✅ **Verify changes persist after save**
- ✅ **Proper Timestamp conversion**
- ✅ **Real-time UI updates**

#### Asset Tracking Tests (financeAssets.cy.ts - 15 tests)
- ✅ Display assets page
- ✅ Show asset form
- ✅ Add investment account
- ✅ Add retirement account
- ✅ Add savings account
- ✅ Add property asset
- ✅ Edit asset balance
- ✅ Delete asset with confirmation
- ✅ Calculate net worth
- ✅ Display last updated date
- ✅ Form validation
- ✅ Asset type badges
- ✅ Institution and account number fields
- ✅ Real-time balance updates
- ✅ Navigate back to finance

#### Reports & Analytics Tests (financeReports.cy.ts - 13 tests)
- ✅ Display reports page
- ✅ Month selector functionality
- ✅ Summary cards (expenses, income, net)
- ✅ Pie chart: expenses by category
- ✅ Pie chart tooltips
- ✅ Top 5 spending categories
- ✅ Bar chart: monthly income vs expenses
- ✅ Line chart: net income trend
- ✅ Chart legends
- ✅ Data filtering by month
- ✅ CSV export button
- ✅ No data state handling
- ✅ Navigate back to finance

### Running Tests Locally

**Prerequisites:**
```bash
# Ensure dev server is running
npm run dev

# In separate terminal, open Cypress
npm run cypress:open
```

**Interactive Testing:**
1. Cypress Test Runner opens
2. Click "E2E Testing"
3. Select Chrome browser
4. Click on any test file to run
5. Watch tests execute in real browser
6. Debug with DevTools

**Headless Testing:**
```bash
# Run all tests
npm run cypress:run

# Run specific test file
npx cypress run --spec "cypress/e2e/financeTransactions.cy.ts"

# Run tests with specific browser
npx cypress run --browser chrome
```

### CI/CD Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
- name: Run Cypress Tests
  run: npm run cypress:run
  env:
    CYPRESS_ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    CYPRESS_ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

**Test Execution in Pipeline:**
1. Code pushed to GitHub
2. GitHub Actions triggered
3. Install dependencies
4. Build application
5. Start preview server
6. Run all Cypress tests
7. Generate screenshots/videos on failure
8. Deploy to GitHub Pages only if tests pass

### Test Data Management

**cypress.env.json:**
```json
{
  "ADMIN_EMAIL": "fbeyhan@gmail.com",
  "ADMIN_PASSWORD": "your-password"
}
```

**GitHub Secrets (for CI/CD):**
- `ADMIN_EMAIL` - Admin email for authentication tests
- `ADMIN_PASSWORD` - Admin password for authentication tests
- `VITE_ADMIN_EMAIL` - Admin email for finance access control

### Page Object Pattern Example

**FinanceTransactionsPage.ts:**
```typescript
export class FinanceTransactionsPage extends BasePage {
  visitTransactionsPage(): void {
    this.visit('/finance/transactions');
  }

  clickEditFirstTransaction(): void {
    cy.contains('Edit').first().click();
  }

  editAmount(newAmount: string): void {
    cy.contains('Amount').parent()
      .find('input[type="number"]')
      .clear()
      .type(newAmount);
  }

  clickSaveEdit(): void {
    cy.contains('Save Changes').click();
  }
}
```

**Test File Usage:**
```typescript
describe('Finance - Transaction History', () => {
  const transactionsPage = new FinanceTransactionsPage();

  it('edits transaction amount and saves', () => {
    transactionsPage.clickEditFirstTransaction();
    transactionsPage.editAmount('99.99');
    transactionsPage.clickSaveEdit();
    cy.wait(1000);
    transactionsPage.verifyTransactionExists('99.99', 'Shopping');
  });
});
```

### Best Practices

**Test Isolation:**
- Each test is independent
- `beforeEach` sets up clean state
- Tests don't rely on previous test data
- Auth state cleared before each test

**Waiting Strategies:**
- Use `cy.wait(1000)` for Firestore operations
- Wait for elements to be visible before interaction
- Avoid arbitrary long waits
- Use Cypress auto-retry logic

**Assertions:**
- Verify UI elements visible
- Check data persistence
- Validate navigation
- Confirm Firestore updates

**Data Cleanup:**
- Tests create temporary data
- Delete actions clean up test data
- Firestore Rules prevent unauthorized access

---

## Development Workflow

### Local Development
```bash
npm run dev              # Start dev server with hot reload
```

### Building for Production
```bash
npm run build            # Creates optimized build in dist/
npm run preview          # Preview production build locally
```

### Running Tests

**Interactive Mode (with GUI):**
```bash
npm run cypress:open
# Opens Cypress Test Runner
# Click on test files to run individually
# Great for debugging and development
```

**Headless Mode (for CI/CD):**
```bash
npm run cypress:run
# Runs all tests in terminal
# Generates screenshots on failure
# Records videos of test execution
# Used in GitHub Actions
```

**Run Specific Test File:**
```bash
npx cypress run --spec "cypress/e2e/login.cy.ts"
npx cypress run --spec "cypress/e2e/familyTree.cy.ts"
```

**Test with Production Build:**
```bash
npm run build
npx vite preview --port 5174
npx cypress run --config baseUrl=http://localhost:5174
```

**Test Results:**
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`
- Logs: Console output during test run

### Code Quality
```bash
npm run lint             # Check for code issues
npm run format           # Format code with Prettier
```

---

## Deployment

### GitHub Pages (Current Deployment Method)

This repository uses GitHub Actions for automated CI/CD deployment to GitHub Pages.

**Workflow Pipeline (`.github/workflows/deploy.yml`):**

1. **Test Job:**
   - Runs on every push to `main` branch
   - Installs dependencies (`npm ci`)
   - Builds the project for preview
   - Starts preview server on port 5174
   - Runs full Cypress E2E test suite
   - Uses Firebase environment variables from GitHub Secrets
   - Blocks deployment if tests fail

2. **Build Job (after tests pass):**
   - Builds production-optimized bundle
   - Uses Firebase environment variables
   - Creates artifacts ready for deployment

3. **Deploy Job:**
   - Uploads build artifacts to GitHub Pages
   - Deploys to custom domain: `beyhanfamily.com`

**Required GitHub Secrets:**
Add these in repository Settings → Secrets and variables → Actions:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**GitHub Pages Configuration:**
1. Go to repository Settings → Pages
2. Source: Select "GitHub Actions"
3. Custom domain: Add `beyhanfamily.com` (if applicable)
4. Enforce HTTPS: Check this option after DNS verification

**DNS Configuration for Custom Domain (Namecheap):**
```
Type: A Record    | Host: @    | Value: 185.199.108.153
Type: A Record    | Host: @    | Value: 185.199.109.153
Type: A Record    | Host: @    | Value: 185.199.110.153
Type: A Record    | Host: @    | Value: 185.199.111.153
Type: CNAME       | Host: www  | Value: <username>.github.io
```

**Deployment Trigger:**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The workflow automatically:
- ✅ Runs all Cypress tests
- ✅ Builds production bundle
- ✅ Deploys to GitHub Pages
- ✅ Updates live site (3-5 minutes)

**Deployment URL:**
- Production: `https://beyhanfamily.com`
- GitHub Pages: `https://<username>.github.io/Beyhan-Family/`

### Monitoring Deployments

View deployment status:
- GitHub Actions tab in repository
- Check workflow runs for success/failure
- View test results and logs
- Download test artifacts (screenshots, videos)

### Alternative Deployment: Netlify

1. **Connect repository to Netlify:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

2. **Required `public/_redirects` file** (already included):
```
/*    /index.html   200
```

3. **Auto-deploy on git push**

### Alternative Deployment: Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel project settings.

---

## Key Development Concepts Explained

### React Component Lifecycle
- **Mounting:** Component is created and inserted into DOM
- **Updating:** State or props change, component re-renders
- **Unmounting:** Component is removed from DOM (cleanup timers/listeners)

### React Hooks Used
- `useState` - Manage component state (form inputs, loading states)
- `useEffect` - Side effects (API calls, event listeners, timers)
- `useContext` - Access global state (authentication)
- `useNavigate` - Programmatic navigation between routes

### TypeScript Benefits
- Type safety catches errors during development
- Better IDE autocomplete and intellisense
- Interfaces define shape of data (props, state)
- Improved code documentation and maintainability

### Firebase Authentication Flow
1. User enters email/password
2. Firebase validates credentials
3. Firebase returns authentication token
4. Token stored in browser (localStorage/sessionStorage)
5. Token sent with requests to verify identity
6. `onAuthStateChanged` monitors auth state changes

### Routing Strategy
- **Client-side routing** - No page reloads when navigating
- **Protected routes** - Check auth before rendering
- **Redirects** - Send unauthenticated users to login
- **Nested routes** - Dashboard contains child routes

### Build Process
1. **Development:** Vite serves files with hot module replacement (HMR)
2. **Production:** 
   - TypeScript → JavaScript (compilation)
   - React JSX → JavaScript (transpilation)
   - CSS → Optimized stylesheet (processing)
   - Assets → Optimized files (minification)
   - Output → `dist/` folder (ready for deployment)

---

## Environment Variables

### Local Development

Create `.env` file in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** Add `.env` to `.gitignore` to prevent committing secrets.

### Production Deployment

**GitHub Actions (Current Setup):**
1. Go to repository Settings → Secrets and variables → Actions
2. Add each environment variable as a repository secret:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

The workflow file (`.github/workflows/deploy.yml`) automatically injects these during build and test jobs.

**Netlify:**
- Dashboard → Site settings → Environment variables
- Add all six Firebase variables

**Vercel:**
- Project settings → Environment Variables
- Add all six Firebase variables
- Select production, preview, and development environments

### Firebase Configuration

Get these values from:
1. Firebase Console → Project Settings
2. Your apps → Web app
3. Firebase configuration object

---

## Troubleshooting Common Issues

### Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173
# Or specify different port
npm run dev -- --port 3000
```

### Firebase authentication errors
- ✅ Verify `.env` file exists with correct values
- ✅ Check Firebase console → Authentication → Sign-in methods
- ✅ Ensure Email/Password provider is enabled
- ✅ Verify authorized domains include localhost and production domain
- ✅ Check browser console for specific Firebase error codes

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript errors
```bash
# Check tsconfig.json is properly configured
# Verify all type definitions are installed
npm install -D @types/react @types/react-dom
```

### Cypress test failures

**Tests fail with "baseUrl" error:**
```bash
# Ensure dev server is running before tests
npm run dev
# In another terminal
npm run cypress:open
```

**Tests fail in CI but pass locally:**
- Check GitHub Secrets are properly configured
- Verify environment variables in workflow file
- Review GitHub Actions logs for specific errors

**Element not found errors:**
- Selectors may have changed - update page objects
- Increase wait times for slow-loading elements
- Check for responsive design breakpoint changes

### Firestore permission denied errors
- Review Firestore security rules
- Ensure user is authenticated before database operations
- Check `createdBy` field matches current user
- See `FIRESTORE_RULES.md` for complete rules documentation

### Date timezone issues
**Problem:** Dates shift by one day for different timezones

**Solution:** Store dates at noon (12:00:00) instead of midnight
```typescript
// Correct way to store dates
const date = new Date(year, month - 1, day, 12, 0, 0)
Timestamp.fromDate(date)
```

### GitHub Actions deployment failures
1. Check Actions tab for error logs
2. Verify all required secrets are added
3. Ensure Cypress tests are passing locally
4. Check GitHub Pages is enabled in settings
5. Review workflow file syntax

### Mobile responsive issues
- Test on actual devices, not just browser DevTools
- Check touch event handlers for mobile interactions
- Verify responsive Tailwind classes (`sm:`, `md:`, `lg:`)
- Test photo upload and cropping on mobile browsers

---

## Key Technical Implementations

### Page Object Model Pattern
This project demonstrates industry-standard test automation architecture:
- **Separation of Concerns:** Test logic separated from page structure
- **Reusability:** Common methods in BasePage inherited by all page objects
- **Maintainability:** Locator changes only require updates in page objects, not tests
- **Scalability:** Easy to add new pages and tests following established patterns

### Firebase Integration
- **Authentication:** Email/password with secure token management
- **Firestore:** NoSQL database for family members and trips data
- **Storage:** Cloud storage for profile pictures and trip photos
- **Security Rules:** Server-side validation and access control

### Responsive Design Strategy
- **Mobile-First Approach:** Base styles for mobile, enhanced for desktop
- **Breakpoints:** `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- **Touch-Friendly:** Adequate button sizes and spacing for mobile
- **Adaptive Layouts:** Flex/grid layouts that reflow based on screen size

### Date Handling Best Practice
**Problem:** Users in different timezones see dates shift by one day

**Solution:** Store dates at noon (12:00:00 UTC) instead of midnight
```typescript
// ✅ Correct: Noon ensures date stays consistent across timezones
const dateOfBirth = new Date(year, month - 1, day, 12, 0, 0)
await updateDoc(memberRef, {
  dateOfBirth: Timestamp.fromDate(dateOfBirth)
})

// ❌ Wrong: Midnight can shift to previous/next day in different timezones
const dateOfBirth = new Date(year, month - 1, day)
```

### CI/CD Pipeline
**Continuous Integration:**
- Every commit triggers automated tests
- Build verification before deployment
- Environment-specific configurations

**Continuous Deployment:**
- Automatic deployment on successful test runs
- Production environment updates within minutes
- Rollback capability via Git history

## Learning Resources

### Core Technologies
- **React:** [react.dev](https://react.dev) - Official React documentation
- **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org) - TypeScript handbook
- **Vite:** [vitejs.dev](https://vitejs.dev) - Next generation frontend tooling
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com) - Utility-first CSS framework

### Firebase
- **Firebase Docs:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **Firestore:** [firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
- **Authentication:** [firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
- **Storage:** [firebase.google.com/docs/storage](https://firebase.google.com/docs/storage)

### Testing
- **Cypress:** [cypress.io](https://www.cypress.io) - E2E testing framework
- **Cypress Best Practices:** [docs.cypress.io/guides/references/best-practices](https://docs.cypress.io/guides/references/best-practices)
- **Page Object Model:** [martinfowler.com/bliki/PageObject.html](https://martinfowler.com/bliki/PageObject.html)

### DevOps
- **GitHub Actions:** [docs.github.com/en/actions](https://docs.github.com/en/actions)
- **GitHub Pages:** [docs.github.com/en/pages](https://docs.github.com/en/pages)

---

## Project Statistics

- **Total Test Files:** 11 (TypeScript E2E tests)
- **Page Objects:** 13 (including BasePage)
- **Test Cases:** 124+ passing tests
- **Finance Tests:** 82 tests (dashboard, add, transactions, assets, reports, edit)
- **Code Coverage:** Authentication, CRUD operations, navigation, file uploads, financial tracking, analytics
- **Lines of Code:** 4,500+ in main application
- **Finance Module:** 1,800+ lines across 5 pages
- **Dependencies:** 25+ npm packages (including recharts for charts)
- **Build Time:** ~15 seconds
- **Test Execution Time:** ~3-4 minutes for full suite
- **Deployment Time:** 5-7 minutes (including tests)

---

## Future Enhancements

Potential features for future development:

**Family Portal:**
- [ ] Advanced family tree visualization (D3.js or similar)
- [ ] Search and filter functionality for family members
- [ ] Export family tree data (PDF, JSON)
- [ ] Photo tagging with family member recognition
- [ ] Event calendar for birthdays and anniversaries
- [ ] Notifications for upcoming family events
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) capabilities
- [ ] Social sharing features
- [ ] Family member comments and stories
- [ ] DNA test integration
- [ ] Historical timeline view
- [ ] Family statistics and analytics

**Personal Finance:**
- [ ] Budget planning and tracking
- [ ] Bill reminders and recurring transactions
- [ ] Bank account integration via Plaid API
- [ ] Tax category tagging for tax preparation
- [ ] Multi-currency support
- [ ] Savings goals and progress tracking
- [ ] Investment performance analytics
- [ ] Spending alerts and notifications
- [ ] Mobile app (React Native)
- [ ] Receipt photo upload and OCR
- [ ] Year-over-year comparison reports
- [ ] Custom category creation
- [ ] Split transactions for shared expenses
- [ ] Financial goal projections

---

## Contributing

This is a private family project. For family members interested in contributing:

1. Contact the repository owner for access
2. Clone the repository
3. Create a feature branch (`git checkout -b feature/YourFeature`)
4. Make changes and write tests
5. Run test suite (`npm run cypress:run`)
6. Commit changes (`git commit -m 'Add feature'`)
7. Push to branch (`git push origin feature/YourFeature`)
8. Create Pull Request

**Coding Standards:**
- Follow existing TypeScript and React patterns
- Write tests for new features using Page Object Model
- Maintain responsive design for all screen sizes
- Document complex functions and components
- Use meaningful commit messages

---

## License

Private family project - not for redistribution.

---

## Contact

For questions or issues, contact the repository maintainer through GitHub.
