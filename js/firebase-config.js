/**
 * Firebase Configuration (compat SDK)
 *
 * This project uses the Firebase "compat" browser SDK via <script> tags.
 * DO NOT use ES-module imports here.
 *
 * Replace these values with your Firebase project configuration:
 * Firebase Console → Project settings → General → Your apps (Web) → Config
 */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBamwItlay70738UP_iIyLkqDLV-yKZLeU",
  authDomain: "cs2-tracker-db.firebaseapp.com",
  projectId: "cs2-tracker-db",
  storageBucket: "cs2-tracker-db.firebasestorage.app",
  messagingSenderId: "71548814520",
  appId: "1:71548814520:web:95867f7f6e770ff26aa04d",
  measurementId: "G-Z4H1NKDB1J"
};
// Expose initialized instances as globals (used by other scripts).
// eslint-disable-next-line no-unused-vars
let app;
// eslint-disable-next-line no-unused-vars
let auth;
// eslint-disable-next-line no-unused-vars
let firestore;
// eslint-disable-next-line no-unused-vars
let realtimeDb;

function initializeFirebaseCompat() {
  if (typeof firebase === "undefined") {
    console.error("Firebase SDK not loaded. Ensure firebase-*-compat.js scripts are included before firebase-config.js.");
    return;
  }

  try {
    app = firebase.apps?.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    firestore = firebase.firestore();
    realtimeDb = firebase.database();

    // Enable offline persistence for Firestore (best-effort).
    firestore.enablePersistence().catch((err) => {
      if (err?.code === "failed-precondition") {
        console.warn("Firestore persistence disabled: multiple tabs open.");
      } else if (err?.code === "unimplemented") {
        console.warn("Firestore persistence unavailable in this browser.");
      } else {
        console.warn("Firestore persistence error:", err);
      }
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

initializeFirebaseCompat();