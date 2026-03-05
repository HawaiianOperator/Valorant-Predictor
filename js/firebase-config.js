/**
 * Firebase Configuration (compat SDK)
 *
 * This project uses the Firebase "compat" browser SDK via <script> tags.
 * DO NOT use ES-module imports here.
 *
 * Replace these values with your Firebase project configuration:
 * Firebase Console → Project settings → General → Your apps (Web) → Config
 */

// eslint-disable-next-line no-unused-vars
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDcFS-w4fvpeJfP6UNai1wNG1212_5o5pg",
    authDomain: "cs-tracker-network.firebaseapp.com",
    projectId: "cs-tracker-network",
    storageBucket: "cs-tracker-network.firebasestorage.app",
    messagingSenderId: "901953081591",
    appId: "1:901953081591:web:dfe953b796226d303b83f2",
    measurementId: "G-XXYCQJ6SFE"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
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