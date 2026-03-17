/**
 * Auth Service
 * Wraps Firebase Auth for the rest of the app.
 */

class AuthService {
  constructor() {
    this.auth = null;
    this.user = null;
    this._ready = false;
    this._readyCallbacks = [];
    this._unsubscribe = null;

    this.initializeAuth();
  }

  initializeAuth() {
    // Wait until Firebase compat SDK is loaded and app initialized.
    if (
      typeof window.firebase !== "undefined" &&
      window.firebase.apps &&
      window.firebase.apps.length > 0
    ) {
      this.auth = window.firebase.auth();
      this.setupAuthStateListener();
      this._ready = true;

      while (this._readyCallbacks.length) {
        const cb = this._readyCallbacks.shift();
        try {
          cb(this);
        } catch (err) {
          console.error("AuthService ready callback failed:", err);
        }
      }
    } else {
      setTimeout(() => this.initializeAuth(), 100);
    }
  }

  setupAuthStateListener() {
    if (!this.auth) return;

    // Keep one internal listener for service state.
    this._unsubscribe = this.auth.onAuthStateChanged((user) => {
      this.user = user || null;
      if (user) {
        console.log("User signed in:", user.email || user.uid);
      } else {
        console.log("User signed out");
      }
    });
  }

  onReady(callback) {
    if (this._ready) {
      callback(this);
    } else {
      this._readyCallbacks.push(callback);
    }
  }

  onAuthStateChanged(callback) {
    // This is the missing method your auth-ui.js expects.
    this.onReady((service) => {
      service.auth.onAuthStateChanged((user) => {
        service.user = user || null;
        callback(user || null);
      });
    });
  }

  getUser() {
    return this.user;
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.user;
  }

  async signInWithEmail(email, password) {
    await new Promise((resolve) => this.onReady(resolve));
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  async signUpWithEmail(email, password) {
    await new Promise((resolve) => this.onReady(resolve));
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  async signOut() {
    await new Promise((resolve) => this.onReady(resolve));
    return this.auth.signOut();
  }
}

window.authService = new AuthService();