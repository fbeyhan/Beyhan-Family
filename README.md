# Beyhan Family Website

A modern, secure family website built with React, TypeScript, Firebase Authentication, and styled with Tailwind CSS. This project serves as both a functional family portal and a learning platform for modern web development practices.

## Table of Contents
- [Project Overview](#project-overview)
- [Complete Development Guide](#complete-development-guide)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [Deployment](#deployment)

---

## Project Overview

**Tech Stack:**
- **React 18** - UI library for building component-based interfaces
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Firebase Authentication** - Secure user authentication
- **React Router** - Client-side routing
- **Cypress** - End-to-end testing framework

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
- `cypress/e2e/` - Contains end-to-end test files
- `cypress/support/` - Custom commands and configuration
- `cypress/fixtures/` - Test data files

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
- **Purpose:** Display family trip information and memories
- **Tied to:** `/trips` route
- **Features:**
  - Trip cards with dates, locations, descriptions
  - Back to dashboard button
- **Protected:** Requires authentication

**File: `src/pages/FamilyTree.tsx`**
- **Purpose:** Visual representation of family relationships
- **Tied to:** `/family-tree` route
- **Features:**
  - Family member cards
  - Relationship visualization
  - Back to dashboard button
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

### Phase 4: Testing Setup

**File: `cypress/e2e/home.cy.js`**
- **Purpose:** End-to-end test for homepage functionality
- **Tests:**
  - Page loads successfully
  - Login form is visible
  - User can log in
  - Navigation works correctly

**File: `cypress/support/commands.js`**
- **Purpose:** Custom Cypress commands for reusable test actions
- **Example:** `cy.login()` command for authenticating in tests

**Running tests:**
```bash
npm run cypress:open    # Interactive mode with GUI
npm run cypress:run     # Headless mode for CI/CD
```

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
├── public/               # Static assets
│   └── _redirects       # Netlify redirects for SPA routing
├── src/
│   ├── components/      # Reusable components
│   │   └── ProtectedRoute.tsx    # Auth guard for private routes
│   ├── config/          # Configuration files
│   │   └── firebase.ts           # Firebase initialization
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── pages/           # Page components
│   │   ├── Login.tsx             # Login page (/)
│   │   ├── Dashboard.tsx         # Main dashboard (/dashboard)
│   │   ├── FamilyPictures.tsx    # Photo gallery (/family-pictures)
│   │   ├── Trips.tsx             # Family trips (/trips)
│   │   ├── FamilyTree.tsx        # Family tree (/family-tree)
│   │   └── ChangePassword.tsx    # Password change (/change-password)
│   ├── App.tsx          # Root component with routing
│   ├── main.tsx         # Application entry point
│   └── styles.css       # Global styles with Tailwind
├── cypress/             # E2E tests
│   ├── e2e/
│   │   └── home.cy.js   # Homepage tests
│   └── support/         # Cypress configuration
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.cjs  # Tailwind CSS configuration
└── cypress.config.js    # Cypress test configuration
```

---

## Features

### Authentication
- ✅ Firebase email/password authentication
- ✅ Protected routes requiring login
- ✅ Auto-logout after 20 minutes of inactivity
- ✅ Password change functionality
- ✅ Persistent sessions across page refreshes

### User Interface
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Modern gradient color schemes
- ✅ Smooth animations and transitions
- ✅ Clean, intuitive navigation

### Pages
- **Login** - Secure authentication entry point
- **Dashboard** - Central hub with navigation cards
- **Family Pictures** - Photo gallery for family memories
- **Trips** - Document family travel experiences
- **Family Tree** - Visual family relationships
- **Change Password** - Update credentials securely

### Security Features
- Protected routes that redirect to login if not authenticated
- Inactivity timeout (20 minutes)
- Firebase Authentication with secure token management

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
```bash
npm run cypress:open     # Interactive test runner
npm run cypress:run      # Headless tests for CI
npm run test:e2e         # Build + test production build
```

### Code Quality
```bash
npm run lint             # Check for code issues
npm run format           # Format code with Prettier
```

---

## Deployment

### GitHub Pages (via GitHub Actions)

This repository includes automatic deployment to GitHub Pages:

1. **Setup GitHub repository:**
```bash
git remote add origin <your-repo-url>
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **GitHub Actions automatically:**
   - Runs on every push to `main` branch
   - Builds the project (`npm run build`)
   - Deploys `dist/` folder to GitHub Pages
   - Workflow file: `.github/workflows/deploy.yml`

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / root

Your site will be live at: `https://<username>.github.io/<repo-name>/`

### Alternative: Netlify

1. **Create `public/_redirects` file** (already included):
```
/*    /index.html   200
```

2. **Deploy:**
   - Connect your GitHub repo to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Netlify automatically deploys on git push

### Alternative: Vercel

```bash
npm install -g vercel
vercel --prod
```

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

Create `.env` file for local development:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**For deployment platforms:**
- GitHub Actions: Add as repository secrets
- Netlify/Vercel: Add in environment variables settings

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
- Verify environment variables are set correctly
- Check Firebase console for enabled authentication methods
- Ensure Firebase project allows your domain

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

---

## Learning Resources

- **React:** [react.dev](https://react.dev)
- **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org)
- **Vite:** [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **Firebase:** [firebase.google.com](https://firebase.google.com)
- **Cypress:** [cypress.io](https://www.cypress.io)

---

## License

Private family project - not for redistribution.

# Beyhan Family Website
