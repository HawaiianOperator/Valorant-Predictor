/**
 * Auth Service
 * Firebase compat wrapper used by auth-ui.js and auth-guard.js
 */

class AuthService {
  constructor() {
    this.auth = null;
    this.user = null;
    this._ready = false;
    this._readyCallbacks = [];

    this.initializeAuth();
  }

  initializeAuth() {
    if (
      typeof window.firebase !== "undefined" &&
      window.firebase.apps &&
      window.firebase.apps.length > 0
    ) {
      this.auth = window.firebase.auth();
      this.setupInternalAuthListener();
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

  setupInternalAuthListener() {
    if (!this.auth) return;

    this.auth.onAuthStateChanged((user) => {
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

  async waitUntilReady() {
    if (this._ready) return;
    await new Promise((resolve) => this.onReady(resolve));
  }

  onAuthStateChanged(callback) {
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
    await this.waitUntilReady();
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  async signUpWithEmail(email, password) {
    await this.waitUntilReady();
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  async signInWithGoogle() {
    await this.waitUntilReady();

    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    return this.auth.signInWithPopup(provider);
  }

  async signInWithGoogleRedirect() {
    await this.waitUntilReady();

    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    return this.auth.signInWithRedirect(provider);
  }

  async signOut() {
    await this.waitUntilReady();
    return this.auth.signOut();
  }
}

window.authService = new AuthService();