/**
 * Firebase Service Layer
 * Provides unified interface for Firestore and Realtime Database operations
 */

class FirebaseService {
    constructor() {
        this.firestore = null;
        this.realtimeDb = null;
        this.auth = null;
        this.initializeServices();
    }

    initializeServices() {
        // Wait for Firebase to be loaded
        if (typeof firebase !== 'undefined' && typeof firestore !== 'undefined' && typeof realtimeDb !== 'undefined' && typeof auth !== 'undefined') {
            this.firestore = firestore;
            this.realtimeDb = realtimeDb;
            this.auth = auth;
        } else {
            // Retry after a short delay
            setTimeout(() => this.initializeServices(), 100);
        }
    }

    // ==================== Firestore Operations ====================

    /**
     * Get CS2 settings for a user
     */
    async getCS2Settings(userId) {
        if (!this.firestore) {
            // Fallback to localStorage if Firestore not available
            return this.getCS2SettingsFromLocalStorage();
        }

        try {
            const settingsRef = this.firestore.collection('cs2Settings').doc(userId);
            const settingsSnap = await settingsRef.get();

            if (settingsSnap.exists) {
                return settingsSnap.data();
            }
        } catch (error) {
            console.error('Error reading from Firestore, using localStorage:', error);
            return this.getCS2SettingsFromLocalStorage();
        }
        
        return null;
    }

    getCS2SettingsFromLocalStorage() {
        return {
            leetifyApiKey: localStorage.getItem('leetify_api_key'),
            steamApiKey: localStorage.getItem('steam_api_key'),
            steamId: localStorage.getItem('steam_id'),
            oddsWeights: (() => {
                const weights = localStorage.getItem('odds_weights');
                return weights ? JSON.parse(weights) : null;
            })()
        };
    }

    /**
     * Save CS2 settings for a user
     */
    async saveCS2Settings(userId, settings) {
        // Always save to localStorage as backup
        if (settings.leetifyApiKey) localStorage.setItem('leetify_api_key', settings.leetifyApiKey);
        if (settings.steamApiKey) localStorage.setItem('steam_api_key', settings.steamApiKey);
        if (settings.steamId) localStorage.setItem('steam_id', settings.steamId);
        if (settings.oddsWeights) localStorage.setItem('odds_weights', JSON.stringify(settings.oddsWeights));

        if (!this.firestore) {
            console.warn('Firestore not initialized, saved to localStorage only');
            return;
        }

        try {
            const settingsRef = this.firestore.collection('cs2Settings').doc(userId);
            
            await settingsRef.set({
                ...settings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving to Firestore, data saved to localStorage:', error);
            throw error;
        }
    }

    /**
     * Save a match to user's match history
     */
    async saveMatch(userId, matchData) {
        if (!this.firestore) {
            throw new Error('Firestore not initialized');
        }

        const { collection, addDoc, serverTimestamp } = firebase.firestore;
        const matchesRef = collection(this.firestore, 'cs2Matches', userId, 'matches');
        
        const matchDoc = {
            ...matchData,
            timestamp: serverTimestamp(),
            userId: userId
        };

        return await addDoc(matchesRef, matchDoc);
    }

    /**
     * Get match history for a user
     */
    async getMatches(userId, limit = 50) {
        if (!this.firestore) {
            throw new Error('Firestore not initialized');
        }

        const { collection, query, orderBy, limit: limitFn, getDocs } = firebase.firestore;
        const matchesRef = collection(this.firestore, 'cs2Matches', userId, 'matches');
        const q = query(matchesRef, orderBy('timestamp', 'desc'), limitFn(limit));
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Get Fallout 4 progress for a user
     */
    async getFallout4Progress(userId) {
        if (!this.firestore) {
            // Fallback to localStorage
            const data = localStorage.getItem('fallout4_data');
            return data ? JSON.parse(data) : null;
        }

        try {
            const progressRef = this.firestore.collection('fallout4Progress').doc(userId);
            const progressSnap = await progressRef.get();

            if (progressSnap.exists) {
                return progressSnap.data();
            }
        } catch (error) {
            console.error('Error reading from Firestore, using localStorage:', error);
            const data = localStorage.getItem('fallout4_data');
            return data ? JSON.parse(data) : null;
        }
        
        return null;
    }

    /**
     * Save Fallout 4 progress for a user
     */
    async saveFallout4Progress(userId, progressData) {
        // Always save to localStorage as backup
        localStorage.setItem('fallout4_data', JSON.stringify(progressData));

        if (!this.firestore) {
            console.warn('Firestore not initialized, saved to localStorage only');
            return;
        }

        try {
            const progressRef = this.firestore.collection('fallout4Progress').doc(userId);
            
            await progressRef.set({
                ...progressData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving to Firestore, data saved to localStorage:', error);
            throw error;
        }
    }

    /**
     * Subscribe to Fallout 4 progress updates
     */
    subscribeToFallout4Progress(userId, callback) {
        if (!this.firestore) {
            throw new Error('Firestore not initialized');
        }

        const progressRef = this.firestore.collection('fallout4Progress').doc(userId);
        
        return progressRef.onSnapshot((doc) => {
            if (doc.exists) {
                callback(doc.data());
            } else {
                callback(null);
            }
        });
    }

    /**
     * Create or update user profile
     */
    async updateUserProfile(userId, userData) {
        if (!this.firestore) {
            throw new Error('Firestore not initialized');
        }

        try {
            const userRef = this.firestore.collection('users').doc(userId);
            
            await userRef.set({
                ...userData,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // ==================== Realtime Database Operations ====================

    /**
     * Subscribe to live match updates
     */
    subscribeToLiveMatch(matchId, callback) {
        if (!this.realtimeDb) {
            throw new Error('Realtime Database not initialized');
        }

        const matchRef = this.realtimeDb.ref(`liveMatches/${matchId}`);
        
        return matchRef.on('value', (snapshot) => {
            const data = snapshot.val();
            callback(data);
        });
    }

    /**
     * Unsubscribe from live match updates
     */
    unsubscribeFromLiveMatch(matchId, unsubscribeFn) {
        if (unsubscribeFn) {
            unsubscribeFn();
        }
    }

    /**
     * Update live match data
     */
    async updateLiveMatch(matchId, matchData) {
        if (!this.realtimeDb) {
            throw new Error('Realtime Database not initialized');
        }

        const matchRef = this.realtimeDb.ref(`liveMatches/${matchId}`);
        
        await matchRef.set({
            ...matchData,
            lastUpdate: firebase.database.ServerValue.TIMESTAMP
        });
    }

    /**
     * Get all live matches
     */
    async getLiveMatches() {
        if (!this.realtimeDb) {
            throw new Error('Realtime Database not initialized');
        }

        const matchesRef = this.realtimeDb.ref('liveMatches');
        const snapshot = await matchesRef.once('value');
        
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return {};
    }
}

// Create singleton instance
const firebaseService = new FirebaseService();