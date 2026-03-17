/**
 * Authentication Service
 * Handles user authentication with Firebase Auth
 */

const auth = firebase.auth();
class AuthService {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.authStateListeners = [];
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
            this.currentUser = user;
            this.notifyAuthStateListeners(user);
        });
    }

    /**
     * Register auth state change listener
     */
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        // Immediately call with current user
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }

    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        if (!this.auth) {
            throw new Error('Auth not initialized');
        }

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign up with email and password
     */
    async signUp(email, password, displayName = null) {
        if (!this.auth) {
            throw new Error('Auth not initialized');
        }

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Update display name if provided
            if (displayName && userCredential.user) {
                await userCredential.user.updateProfile({ displayName });
            }

            // Create user profile in Firestore
            if (userCredential.user) {
                await firebaseService.updateUserProfile(userCredential.user.uid, {
                    email: userCredential.user.email,
                    displayName: displayName || userCredential.user.displayName || email.split('@')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        if (!this.auth) {
            throw new Error('Auth not initialized');
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            const userCredential = await this.auth.signInWithPopup(provider);
            
            // Create/update user profile in Firestore
            if (userCredential.user) {
                await firebaseService.updateUserProfile(userCredential.user.uid, {
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign out
     */
    async signOut() {
        if (!this.auth) {
            throw new Error('Auth not initialized');
        }

        try {
            await this.auth.signOut();
            this.currentUser = null;
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get user-friendly error messages
     */
    getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
            'permission-denied': 'You do not have permission to perform this action.',
            'unavailable': 'Service is temporarily unavailable. Please try again later.',
            'deadline-exceeded': 'Request timed out. Please try again.'
        };

        return errorMessages[error.code] || error.message || 'An error occurred. Please try again.';
    }
}

// Create singleton instance
const authService = new AuthService();