# Firebase Setup Guide

This guide will walk you through setting up Firebase for the CS2 Tracker Network application.

## Prerequisites

- A Google account
- Basic understanding of Firebase services

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "cs2-tracker-network")
4. Optionally enable Google Analytics
5. Click "Create project"
6. Wait for project creation to complete

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Click **Get started**
3. Enable the following sign-in methods:
   - **Email/Password**: Enable and save
   - **Google**: Enable, add project support email, and save

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location for your database (choose closest to your users)
5. Click **Enable**

## Step 4: Create Realtime Database

1. In Firebase Console, go to **Realtime Database**
2. Click **Create database**
3. Choose a location
4. Start in **test mode** (we'll add security rules later)
5. Click **Enable**

## Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "CS2 Tracker Web")
5. Copy the Firebase configuration object

## Step 6: Configure the Application

1. Open `js/firebase-config.js` in your project
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};
```

3. Save the file

## Step 7: Deploy Security Rules

1. Open `firebase-rules.md` in this project
2. Copy the Firestore security rules
3. In Firebase Console, go to **Firestore Database** > **Rules**
4. Paste the rules and click **Publish**
5. Copy the Realtime Database security rules
6. In Firebase Console, go to **Realtime Database** > **Rules**
7. Paste the rules and click **Publish**

## Step 8: Test the Setup

1. Open `index.html` in your browser
2. Click "Sign In" or "Sign Up"
3. Create a test account
4. Verify that you can:
   - Sign in/out successfully
   - Access CS2 Tracker and save settings
   - Access Fallout 4 Tracker and save progress

## Troubleshooting

### "Firebase not initialized" errors
- Check that Firebase SDK scripts are loaded before your app scripts
- Verify your Firebase config is correct
- Check browser console for detailed error messages

### Authentication not working
- Verify Email/Password and Google sign-in are enabled in Firebase Console
- Check that your domain is authorized (for production)
- Ensure security rules allow authenticated users

### Firestore/Realtime Database errors
- Verify databases are created and enabled
- Check security rules are deployed correctly
- Ensure user is authenticated before accessing data

### CORS errors
- These shouldn't occur with Firebase SDK, but if they do, check Firebase project settings
- Verify API keys are correct

## Production Considerations

1. **Custom Domain**: Add your domain to authorized domains in Authentication settings
2. **Security Rules**: Review and tighten security rules for production
3. **Billing**: Monitor usage and set up billing alerts
4. **Backup**: Set up automated backups for Firestore
5. **Monitoring**: Enable Firebase Performance Monitoring and Crashlytics

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Realtime Database Documentation](https://firebase.google.com/docs/database)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review Firebase Console for service status
3. Check Firebase documentation for your specific issue
4. Verify all configuration steps were completed correctly