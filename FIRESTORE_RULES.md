# Firestore Security Rules for Family Website

## Required Collections

Your app uses the following Firestore collections:
1. `familyPhotos` - For Family Pictures page
2. `familyTrips` - For Family Trips (trip information)
3. `tripPhotos` - For photos associated with each trip
4. `familyMembers` - For Family Tree page (member profiles)

## Security Rules Setup

Go to Firebase Console → Firestore Database → Rules and apply these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Family Photos Collection
    match /familyPhotos/{photoId} {
      // Allow authenticated users to read all photos
      allow read: if isSignedIn();
      
      // Allow authenticated users to create photos
      allow create: if isSignedIn() 
                    && request.resource.data.uploadedBy == request.auth.token.email;
      
      // Allow users to update their own photos
      allow update: if isSignedIn() 
                    && resource.data.uploadedBy == request.auth.token.email;
      
      // Allow users to delete their own photos
      allow delete: if isSignedIn() 
                    && resource.data.uploadedBy == request.auth.token.email;
    }
    
    // Family Trips Collection
    match /familyTrips/{tripId} {
      // Allow authenticated users to read all trips
      allow read: if isSignedIn();
      
      // Allow authenticated users to create trips
      allow create: if isSignedIn() 
                    && request.resource.data.createdBy == request.auth.token.email;
      
      // Allow users to update their own trips
      allow update: if isSignedIn() 
                    && resource.data.createdBy == request.auth.token.email;
      
      // Allow users to delete their own trips
      allow delete: if isSignedIn() 
                    && resource.data.createdBy == request.auth.token.email;
    }
    
    // Trip Photos Collection
    match /tripPhotos/{photoId} {
      // Allow authenticated users to read all trip photos
      allow read: if isSignedIn();
      
      // Allow authenticated users to create trip photos
      allow create: if isSignedIn() 
                    && request.resource.data.uploadedBy == request.auth.token.email;
      
      // Allow users to update their own trip photos
      allow update: if isSignedIn() 
                    && resource.data.uploadedBy == request.auth.token.email;
      
      // Allow users to delete their own trip photos
      allow delete: if isSignedIn() 
                    && resource.data.uploadedBy == request.auth.token.email;
    }
    
    // Family Members Collection (Family Tree)
    match /familyMembers/{memberId} {
      // Allow authenticated users to read all family members
      allow read: if isSignedIn();
      
      // Allow authenticated users to create family members
      allow create: if isSignedIn() 
                    && request.resource.data.createdBy == request.auth.token.email;
      
      // Allow users to update their own family members
      allow update: if isSignedIn() 
                    && resource.data.createdBy == request.auth.token.email;
      
      // Allow users to delete their own family members
      allow delete: if isSignedIn() 
                    && resource.data.createdBy == request.auth.token.email;
    }
  }
}
```

## Alternative: Allow All Authenticated Users (For Testing)

If you want all authenticated family members to be able to edit/delete anything (simpler approach for a family website):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow all authenticated users full access to all collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Storage Rules

Also ensure your Firebase Storage rules allow authenticated users to upload:

Go to Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Family photos folder
    match /family-photos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024; // Max 10MB
    }
    
    // Trip photos folder
    match /trip-photos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024; // Max 10MB
    }
  }
}
```

## How to Apply These Rules

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy and paste the Firestore rules above
5. Click **Publish**
6. Go to **Storage** → **Rules** tab
7. Copy and paste the Storage rules above
8. Click **Publish**

## Troubleshooting

If you're still getting errors after applying rules:

1. **Check if Firestore is enabled**: Go to Firestore Database and make sure it's initialized
2. **Check authentication**: Make sure you're logged in (check browser console for auth state)
3. **Check browser console**: Look for specific error messages with error codes
4. **Test rules**: Use the Firebase Console's Rules Playground to test your rules
5. **Clear cache**: Sometimes clearing browser cache helps after rule changes

## Common Error Codes

- `permission-denied`: Security rules are blocking the operation
- `not-found`: Collection or document doesn't exist
- `unavailable`: Network issue or Firestore service temporarily unavailable
- `unauthenticated`: User is not logged in
