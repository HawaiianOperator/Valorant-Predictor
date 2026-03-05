/**
 * Authentication UI Handler
 * Manages authentication UI interactions
 */

class AuthUI {
    constructor() {
        this.authModal = document.getElementById('auth-modal');
        this.signInBtn = document.getElementById('sign-in-btn');
        this.signOutBtn = document.getElementById('sign-out-btn');
        this.userDisplay = document.getElementById('user-display');
        this.currentTab = 'signin';
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupAuthStateListener();
    }

    initializeElements() {
        // Tab buttons
        this.tabButtons = document.querySelectorAll('.auth-tab-btn');
        this.signinForm = document.getElementById('signin-form');
        this.signupForm = document.getElementById('signup-form');
        
        // Forms
        this.signinFormElement = document.getElementById('signin-form-element');
        this.signupFormElement = document.getElementById('signup-form-element');
        
        // Inputs
        this.signinEmail = document.getElementById('signin-email');
        this.signinPassword = document.getElementById('signin-password');
        this.signupName = document.getElementById('signup-name');
        this.signupEmail = document.getElementById('signup-email');
        this.signupPassword = document.getElementById('signup-password');
        
        // Buttons
        this.googleSigninBtn = document.getElementById('google-signin-btn');
        this.googleSignupBtn = document.getElementById('google-signup-btn');
        
        // Error messages
        this.signinError = document.getElementById('signin-error');
        this.signupError = document.getElementById('signup-error');
        
        // Close button
        this.closeBtn = this.authModal?.querySelector('.close');
    }

    attachEventListeners() {
        // Sign in/out buttons
        if (this.signInBtn) {
            this.signInBtn.addEventListener('click', () => this.openAuthModal('signin'));
        }
        
        if (this.signOutBtn) {
            this.signOutBtn.addEventListener('click', () => this.handleSignOut());
        }

        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Form submissions
        if (this.signinFormElement) {
            this.signinFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn();
            });
        }

        if (this.signupFormElement) {
            this.signupFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp();
            });
        }

        // Google sign in
        if (this.googleSigninBtn) {
            this.googleSigninBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        if (this.googleSignupBtn) {
            this.googleSignupBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        // Close modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeAuthModal());
        }

        // Close on outside click
        if (this.authModal) {
            this.authModal.addEventListener('click', (e) => {
                if (e.target === this.authModal) {
                    this.closeAuthModal();
                }
            });
        }

        // Disable tracker links until authenticated
        document.addEventListener('click', (e) => {
            const link = e.target?.closest?.('a[data-requires-auth="true"]');
            if (!link) return;
            if (!authService.getCurrentUser()) {
                e.preventDefault();
                this.openAuthModal('signin');
            }
        });
    }

    setupAuthStateListener() {
        authService.onAuthStateChanged((user) => {
            this.updateAuthUI(user);
        });
    }

    updateAuthUI(user) {
        if (user) {
            // User is signed in
            if (this.signInBtn) this.signInBtn.style.display = 'none';
            if (this.signOutBtn) this.signOutBtn.style.display = 'inline-block';
            if (this.userDisplay) {
                this.userDisplay.textContent = user.displayName || user.email || 'User';
                this.userDisplay.style.display = 'inline-block';
            }
            this.closeAuthModal();
        } else {
            // User is signed out
            if (this.signInBtn) this.signInBtn.style.display = 'inline-block';
            if (this.signOutBtn) this.signOutBtn.style.display = 'none';
            if (this.userDisplay) this.userDisplay.style.display = 'none';
        }
    }

    openAuthModal(tab = 'signin') {
        if (this.authModal) {
            this.authModal.style.display = 'block';
            this.switchTab(tab);
        }
    }

    closeAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
            this.clearErrors();
            this.clearForms();
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update forms
        if (this.signinForm) {
            this.signinForm.classList.toggle('active', tab === 'signin');
        }
        if (this.signupForm) {
            this.signupForm.classList.toggle('active', tab === 'signup');
        }

        this.clearErrors();
    }

    async handleSignIn() {
        const email = this.signinEmail.value.trim();
        const password = this.signinPassword.value;

        if (!email || !password) {
            this.showError('signin', 'Please fill in all fields');
            return;
        }

        this.showLoading('signin', true);
        const result = await authService.signIn(email, password);
        this.showLoading('signin', false);

        if (result.success) {
            this.closeAuthModal();
            // Trigger migration if needed
            if (window.migrateLocalStorageData) {
                window.migrateLocalStorageData();
            }
        } else {
            this.showError('signin', result.error);
        }
    }

    async handleSignUp() {
        const name = this.signupName.value.trim();
        const email = this.signupEmail.value.trim();
        const password = this.signupPassword.value;

        if (!email || !password) {
            this.showError('signup', 'Please fill in email and password');
            return;
        }

        if (password.length < 8) {
            this.showError('signup', 'Password must be at least 8 characters');
            return;
        }

        this.showLoading('signup', true);
        const result = await authService.signUp(email, password, name || null);
        this.showLoading('signup', false);

        if (result.success) {
            this.closeAuthModal();
            // Trigger migration if needed
            if (window.migrateLocalStorageData) {
                window.migrateLocalStorageData();
            }
        } else {
            this.showError('signup', result.error);
        }
    }

    async handleGoogleSignIn() {
        this.showLoading(this.currentTab, true);
        const result = await authService.signInWithGoogle();
        this.showLoading(this.currentTab, false);

        if (result.success) {
            this.closeAuthModal();
            // Trigger migration if needed
            if (window.migrateLocalStorageData) {
                window.migrateLocalStorageData();
            }
        } else {
            this.showError(this.currentTab, result.error);
        }
    }

    async handleSignOut() {
        const result = await authService.signOut();
        if (result.success) {
            // Clear any cached data
            if (window.clearLocalCache) {
                window.clearLocalCache();
            }
        } else {
            alert('Error signing out: ' + result.error);
        }
    }

    showError(form, message) {
        const errorEl = form === 'signin' ? this.signinError : this.signupError;
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    clearErrors() {
        if (this.signinError) {
            this.signinError.textContent = '';
            this.signinError.style.display = 'none';
        }
        if (this.signupError) {
            this.signupError.textContent = '';
            this.signupError.style.display = 'none';
        }
    }

    clearForms() {
        if (this.signinEmail) this.signinEmail.value = '';
        if (this.signinPassword) this.signinPassword.value = '';
        if (this.signupName) this.signupName.value = '';
        if (this.signupEmail) this.signupEmail.value = '';
        if (this.signupPassword) this.signupPassword.value = '';
    }

    showLoading(form, isLoading) {
        const formElement = form === 'signin' ? this.signinFormElement : this.signupFormElement;
        if (formElement) {
            const submitBtn = formElement.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = isLoading;
                submitBtn.textContent = isLoading ? 'Loading...' : (form === 'signin' ? 'Sign In' : 'Sign Up');
            }
        }
    }
}

// Initialize auth UI when DOM is ready
let authUI;
document.addEventListener('DOMContentLoaded', () => {
    authUI = new AuthUI();
});