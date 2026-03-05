# Firebase Security Rules

This document contains the security rules for Firestore and Realtime Database that need to be deployed to your Firebase project.

## Firestore Security Rules

Deploy these rules in the Firebase Console under Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // CS2 Settings - users can only access their own settings
    match /cs2Settings/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // CS2 Matches - users can only access their own match history
    match /cs2Matches/{userId}/matches/{matchId} {
      allow read, write: if isOwner(userId);
    }
    
    // Fallout 4 Progress - users can only access their own progress
    match /fallout4Progress/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## Realtime Database Security Rules

Deploy these rules in the Firebase Console under Realtime Database > Rules:

```json
{
  "rules": {
    "liveMatches": {
      "$matchId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Deployment Instructions

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. For Firestore:
   - Navigate to Firestore Database > Rules
   - Paste the Firestore rules above
   - Click "Publish"
4. For Realtime Database:
   - Navigate to Realtime Database > Rules
   - Paste the Realtime Database rules above
   - Click "Publish"

## Testing Rules

After deploying, test your rules to ensure:
- Users can only read/write their own data
- Unauthenticated users cannot access any data
- Users cannot access other users' data

## Important Notes

- These rules ensure that users can only access their own data
- All operations require authentication
- The rules use the user's UID from Firebase Auth to verify ownership
- Make sure to test thoroughly before deploying to production