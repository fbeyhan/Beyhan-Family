# Copilot Instructions for Beyhan Family Website

This guide enables AI coding agents to work productively in the Beyhan Family Website codebase. It summarizes architecture, workflows, conventions, and integration points unique to this project.

## Architecture Overview
- **Frontend:** React 18 + TypeScript, built with Vite, styled using Tailwind CSS.
- **Authentication & Data:** Firebase (Auth, Firestore, Storage) with config in `src/config/firebase.ts` and secrets via `.env`.
- **Routing:** React Router, routes defined in `src/App.tsx`.
- **Global State:** Managed via React Context (`src/context/AuthContext.tsx`).
- **Protected Routes:** Use `ProtectedRoute` component for access control.
- **Pages:** Located in `src/pages/`, each page matches a route and encapsulates its logic.
- **Reusable Components:** In `src/components/`.

## Testing
- **E2E Tests:** Cypress with TypeScript, organized by Page Object Model (POM) in `cypress/support/pages/`.
- **Test files:** In `cypress/e2e/`, helpers in `cypress/support/helpers/`.
- **Run tests:**
  - `npm run cypress:open` (GUI)
  - `npm run cypress:run` (headless)
  - `npx cypress run --spec "cypress/e2e/login.cy.ts"` (single test)
- **Test credentials:** Use `cypress.env.json` (local) or GitHub Actions secrets (CI).

## Build & Deployment
- **Dev server:** `npm run dev` (Vite, port 5173)
- **Build:** `npm run build` (output to `dist/`)
- **Preview:** `npm run preview`
- **Deploy:** GitHub Pages via CI/CD (`.github/workflows/`)

## Project Conventions
- **Styling:** Tailwind utility classes in JSX, responsive design, custom colors/fonts.
- **Page Object Model:** All Cypress tests use POM classes for maintainability.
- **Environment variables:** Sensitive data in `.env` (frontend) and `cypress.env.json` (tests).
- **Auth timeout:** Auto-logout after 20 minutes inactivity (see `AuthContext`).
- **File uploads:** Handled via Firebase Storage (photos, profile images).
- **Date handling:** Consistent timezone logic in trip and family tree features.

## Integration Points
- **Firebase:** All auth and data flows go through `src/config/firebase.ts` and `AuthContext`.
- **Cypress:** Tests use custom commands and helpers in `cypress/support/`.
- **CI/CD:** Secrets and environment variables must be set for tests to pass in CI.

## Key Files & Directories
- `src/App.tsx`, `src/main.tsx` — App entry and routing
- `src/context/AuthContext.tsx` — Global auth state
- `src/components/ProtectedRoute.tsx` — Route protection
- `src/pages/` — Main page components
- `src/config/firebase.ts` — Firebase setup
- `cypress/e2e/` — Test specs
- `cypress/support/pages/` — POM classes
- `.github/workflows/` — CI/CD config

## Example Patterns
- **Protected Route:**
  ```tsx
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
  ```
- **Firebase Auth Usage:**
  ```ts
  import { auth } from '../config/firebase'
  // ... use auth for login/logout
  ```
- **Cypress POM Usage:**
  ```ts
  const loginPage = new LoginPage()
  loginPage.login('email', 'password')
  ```

---
For unclear or missing conventions, ask for clarification or review the README for additional context.
