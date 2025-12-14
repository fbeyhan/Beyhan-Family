# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the Beyhan Family Website and manage user access.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "Beyhan Family Website")
4. Disable Google Analytics (optional for family website)
5. Click **"Create project"**

## Step 2: Enable Email/Password Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first option (Email/Password)
6. **DO NOT** enable "Email link (passwordless sign-in)" - this prevents public registration
7. Click **"Save"**

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to Project Overview
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register app with nickname (e.g., "Family Website")
6. Copy the `firebaseConfig` object

## Step 4: Update Your Project Configuration

1. Open `src/config/firebase.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "AIza...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Add Family Members (Admin-Only)

**IMPORTANT:** Only you (as admin) can create user accounts. Family members CANNOT self-register.

### Method 1: Firebase Console (Recommended)

1. In Firebase Console, go to **Authentication** > **Users** tab
2. Click **"Add user"**
3. Enter family member's email and create a password
4. Click **"Add user"**
5. Send the email and password to the family member securely (text, call, etc.)

### Method 2: Using Firebase Admin SDK (Advanced)

If you need to create many users at once, you can use the Firebase Admin SDK from a Node.js script.

## Step 6: Security Rules

Your Firebase Authentication is now configured to:
- ✅ **Only allow admin-created users** to sign in
- ✅ **Prevent public registration** (no sign-up page exists)
- ✅ **Persist login state** across page refreshes
- ✅ **Use secure email/password authentication**

## Step 7: Deploy Your Website

After updating the Firebase config, build and deploy your website:

```bash
npm run build
```

Then deploy to your hosting platform (Netlify, Vercel, etc.)

## Managing Users

### Adding a New Family Member
1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter their email and set a password
4. Share credentials with them privately

### Removing Access
1. Go to Firebase Console > Authentication > Users
2. Find the user
3. Click the three dots (⋮) menu
4. Select "Delete user"

### Resetting Passwords
1. Go to Firebase Console > Authentication > Users
2. Find the user
3. Click the three dots (⋮) menu
4. Select "Reset password"
5. They'll receive a password reset email

## Optional: Email Verification

To require email verification before users can access the site:

1. In Login.tsx, add a check after successful login:
```typescript
if (success && auth.currentUser && !auth.currentUser.emailVerified) {
  setError('Please verify your email before logging in.')
  await logout()
  return
}
```

2. After creating users, send verification emails via Firebase Console

## Security Best Practices

1. **Never commit** your Firebase config with actual values to public repositories
2. Use **environment variables** for production:
   - Create a `.env` file
   - Add Firebase config as environment variables
   - Update `firebase.ts` to use `import.meta.env.VITE_FIREBASE_API_KEY`, etc.
3. Set up **Firebase Security Rules** for any future database/storage usage
4. Regularly review the **Users** list in Firebase Console
5. Use **strong passwords** for all family members

## Troubleshooting

### "Configuration object is not valid"
- Double-check all values in `firebase.ts` match your Firebase Console config

### "Email already in use"
- This user already exists; use password reset instead

### "Invalid email"
- Ensure the email format is correct

### Users can't log in
- Verify Email/Password auth is enabled in Firebase Console
- Check that user exists in Authentication > Users tab
- Ensure they're using the correct email and password

## Support

For more information, visit:
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
