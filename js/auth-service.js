/**
 * Auth Service
 * Handles Firebase authentication safely
 */

class AuthService {
    constructor() {
        this.auth = null;
        this.user = null;

        this.initializeAuth();
    }

    initializeAuth() {
        if (typeof firebase !== 'undefined' && firebase?.apps?.length) {
            this.auth = firebase.auth();
            this.setupAuthStateListener();
        } else {
            setTimeout(() => this.initializeAuth(), 100);
        }
    }

    setupAuthStateListener() {
        if (!this.auth) return;

        this.auth.onAuthStateChanged((user) => {
            this.user = user;

            if (user) {
                console.log("User signed in:", user.email);
            } else {
                console.log("User signed out");
            }
        });
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.user;
    }

    signOut() {
        if (this.auth) {
            return this.auth.signOut();
        }
    }
}

// Global instance
window.authService = new AuthService();