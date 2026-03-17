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
        this.currentUser = null;

        this.initializeElements();
        this.attachEventListeners();
        this.setupAuthStateListener();
    }

    initializeElements() {
        this.tabButtons = document.querySelectorAll('.auth-tab-btn');
        this.signinForm = document.getElementById('signin-form');
        this.signupForm = document.getElementById('signup-form');

        this.signinFormElement = document.getElementById('signin-form-element');
        this.signupFormElement = document.getElementById('signup-form-element');

        this.signinEmail = document.getElementById('signin-email');
        this.signinPassword = document.getElementById('signin-password');
        this.signupName = document.getElementById('signup-name');
        this.signupEmail = document.getElementById('signup-email');
        this.signupPassword = document.getElementById('signup-password');

        this.googleSigninBtn = document.getElementById('google-signin-btn');
        this.googleSignupBtn = document.getElementById('google-signup-btn');

        this.signinError = document.getElementById('signin-error');
        this.signupError = document.getElementById('signup-error');

        this.closeBtn = this.authModal?.querySelector('.close');
    }

    attachEventListeners() {
        if (this.signInBtn) {
            this.signInBtn.addEventListener('click', () => this.openAuthModal('signin'));
        }

        if (this.signOutBtn) {
            this.signOutBtn.addEventListener('click', () => this.handleSignOut());
        }

        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

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

        if (this.googleSigninBtn) {
            this.googleSigninBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        if (this.googleSignupBtn) {
            this.googleSignupBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeAuthModal());
        }

        if (this.authModal) {
            this.authModal.addEventListener('click', (e) => {
                if (e.target === this.authModal) {
                    this.closeAuthModal();
                }
            });
        }

        document.addEventListener('click', (e) => {
            const link = e.target?.closest?.('a[data-requires-auth="true"]');
            if (!link) return;

            if (!window.authService?.getCurrentUser?.()) {
                e.preventDefault();
                this.openAuthModal('signin');
            }
        });
    }

    setupAuthStateListener() {
        if (!window.authService) {
            console.warn('authService not available yet');
            return;
        }

        window.authService.onAuthStateChanged((user) => {
            this.currentUser = user || null;
            this.updateAuthUI(user || null);
        });
    }

    updateAuthUI(user) {
        if (user) {
            if (this.signInBtn) this.signInBtn.style.display = 'none';
            if (this.signOutBtn) this.signOutBtn.style.display = 'inline-block';

            if (this.userDisplay) {
                this.userDisplay.textContent = user.displayName || user.email || 'User';
                this.userDisplay.style.display = 'inline-block';
            }

            this.closeAuthModal();
        } else {
            if (this.signInBtn) this.signInBtn.style.display = 'inline-block';
            if (this.signOutBtn) this.signOutBtn.style.display = 'none';

            if (this.userDisplay) {
                this.userDisplay.textContent = '';
                this.userDisplay.style.display = 'none';
            }
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

        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        if (this.signinForm) {
            this.signinForm.classList.toggle('active', tab === 'signin');
        }

        if (this.signupForm) {
            this.signupForm.classList.toggle('active', tab === 'signup');
        }

        this.clearErrors();
    }

    async handleSignIn() {
        const email = this.signinEmail?.value.trim();
        const password = this.signinPassword?.value;

        if (!email || !password) {
            this.showError('signin', 'Please fill in all fields');
            return;
        }

        try {
            this.showLoading('signin', true);

            if (!window.authService?.signInWithEmail) {
                throw new Error('Email sign-in is not available');
            }

            await window.authService.signInWithEmail(email, password);
            this.closeAuthModal();

            if (window.migrateLocalStorageData) {
                window.migrateLocalStorageData();
            }
        } catch (error) {
            console.error('Sign-in failed:', error);
            this.showError('signin', error?.message || 'Failed to sign in');
        } finally {
            this.showLoading('signin', false);
        }
    }

    async handleSignUp() {
        const name = this.signupName?.value.trim();
        const email = this.signupEmail?.value.trim();
        const password = this.signupPassword?.value;

        if (!email || !password) {
            this.showError('signup', 'Please fill in email and password');
            return;
        }

        if (password.length < 8) {
            this.showError('signup', 'Password must be at least 8 characters');
            return;
        }

        try {
            this.showLoading('signup', true);

            if (!window.authService?.signUpWithEmail) {
                throw new Error('Email sign-up is not available');
            }

            const cred = await window.authService.signUpWithEmail(email, password);

            if (name && cred?.user?.updateProfile) {
                await cred.user.updateProfile({ displayName: name });
            }

            this.closeAuthModal();

            if (window.migrateLocalStorageData) {
                window.migrateLocalStorageData();
            }
        } catch (error) {
            console.error('Sign-up failed:', error);
            this.showError('signup', error?.message || 'Failed to sign up');
        } finally {
            this.showLoading('signup', false);
        }
    }

    async handleGoogleSignIn() {
        try {
            this.clearErrors();

            if (!window.authService?.signInWithGoogle) {
                throw new Error('Google sign-in is not available');
            }

            await window.authService.signInWithGoogle();
        } catch (error) {
            console.error('Google sign-in failed:', error);
            this.showError(this.currentTab || 'signin', error?.message || 'Google sign-in failed. Please try again.');
        }
    }

    async handleSignOut() {
        try {
            if (!window.authService?.signOut) {
                throw new Error('Sign-out is not available');
            }

            await window.authService.signOut();

            if (window.clearLocalCache) {
                window.clearLocalCache();
            }
        } catch (error) {
            console.error('Sign-out failed:', error);
            alert('Error signing out: ' + (error?.message || 'Unknown error'));
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
                submitBtn.textContent = isLoading
                    ? 'Loading...'
                    : (form === 'signin' ? 'Sign In' : 'Sign Up');
            }
        }
    }
}

let authUI;
document.addEventListener('DOMContentLoaded', () => {
    authUI = new AuthUI();
});