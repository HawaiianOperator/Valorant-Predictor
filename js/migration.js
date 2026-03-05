/**
 * Migration Utility
 * Migrates localStorage data to Firestore on first login
 */

async function migrateLocalStorageData() {
    const user = authService.getCurrentUser();
    if (!user) {
        return;
    }

    try {
        // Check if migration has already been done
        const migrationFlag = localStorage.getItem(`migration_done_${user.uid}`);
        if (migrationFlag === 'true') {
            return; // Migration already completed
        }

        let hasData = false;

        // Migrate CS2 settings
        const leetifyKey = localStorage.getItem('leetify_api_key');
        const steamKey = localStorage.getItem('steam_api_key');
        const steamId = localStorage.getItem('steam_id');
        const oddsWeights = localStorage.getItem('odds_weights');

        if (leetifyKey || steamKey || steamId || oddsWeights) {
            hasData = true;
            const settings = {};
            
            if (leetifyKey) settings.leetifyApiKey = leetifyKey;
            if (steamKey) settings.steamApiKey = steamKey;
            if (steamId) settings.steamId = steamId;
            if (oddsWeights) {
                try {
                    settings.oddsWeights = JSON.parse(oddsWeights);
                } catch (e) {
                    console.error('Error parsing odds weights:', e);
                }
            }

            await firebaseService.saveCS2Settings(user.uid, settings);
            console.log('CS2 settings migrated to Firestore');
        }

        // Migrate Fallout 4 progress
        const fallout4Data = localStorage.getItem('fallout4_data');
        if (fallout4Data) {
            hasData = true;
            try {
                const progressData = JSON.parse(fallout4Data);
                await firebaseService.saveFallout4Progress(user.uid, progressData);
                console.log('Fallout 4 progress migrated to Firestore');
            } catch (e) {
                console.error('Error migrating Fallout 4 data:', e);
            }
        }

        if (hasData) {
            // Mark migration as complete
            localStorage.setItem(`migration_done_${user.uid}`, 'true');
            
            // Show notification
            if (window.showNotification) {
                window.showNotification('Data migrated to cloud successfully!', 'success');
            } else {
                console.log('Data migration completed');
            }
        }
    } catch (error) {
        console.error('Error during migration:', error);
        // Don't throw - migration failure shouldn't break the app
    }
}

// Make function available globally
window.migrateLocalStorageData = migrateLocalStorageData;

// Clear local cache helper
function clearLocalCache() {
    // Don't clear everything - keep migration flags
    const keysToKeep = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('migration_done_')) {
            keysToKeep.push(key);
        }
    }

    // Clear all except migration flags
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
            localStorage.removeItem(key);
        }
    }
}

window.clearLocalCache = clearLocalCache;