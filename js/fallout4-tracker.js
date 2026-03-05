/**
 * Fallout 4 Progress Tracker
 * Tracks gameplay progress, achievements, and statistics
 */
class Fallout4Tracker {
    constructor() {
        this.gameData = null;
        this.currentUser = null;
        this.progressUnsubscribe = null;
        this.initializeElements();
        this.setupAuthListener();
        this.attachEventListeners();
    }

    setupAuthListener() {
        authService.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                await this.loadGameData();
                this.setupRealtimeSync();
            } else {
                // Load from localStorage as fallback
                this.gameData = this.loadGameDataFromLocalStorage();
                this.loadData();
            }
        });
    }

    setupRealtimeSync() {
        if (!this.currentUser) return;

        // Subscribe to real-time updates
        try {
            this.progressUnsubscribe = firebaseService.subscribeToFallout4Progress(
                this.currentUser.uid,
                (data) => {
                    if (data) {
                        this.gameData = data;
                        this.loadData();
                    }
                }
            );
        } catch (error) {
            console.error('Error setting up real-time sync:', error);
        }
    }

    initializeElements() {
        // Stats elements
        this.playtimeEl = document.getElementById('playtime');
        this.levelEl = document.getElementById('level');
        this.questsCompletedEl = document.getElementById('quests-completed');
        this.enemiesKilledEl = document.getElementById('enemies-killed');
        this.achievementsUnlockedEl = document.getElementById('achievements-unlocked');
        this.locationsDiscoveredEl = document.getElementById('locations-discovered');

        // File input
        this.saveFileInput = document.getElementById('save-file-input');
        this.scanSavesBtn = document.getElementById('scan-saves-btn');

        // Tabs
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Filter buttons
        this.filterButtons = document.querySelectorAll('.filter-btn');

        // Containers
        this.mainQuestList = document.getElementById('main-quest-list');
        this.sideQuestList = document.getElementById('side-quest-list');
        this.factionList = document.getElementById('faction-list');
        this.settlementList = document.getElementById('settlement-list');
        this.achievementsGrid = document.getElementById('achievements-grid');
        this.specialStats = document.getElementById('special-stats');
        this.combatStats = document.getElementById('combat-stats');
        this.explorationStats = document.getElementById('exploration-stats');
    }

    attachEventListeners() {
        // File input
        this.saveFileInput.addEventListener('change', (e) => this.handleSaveFile(e));
        this.scanSavesBtn.addEventListener('click', () => this.scanSaveDirectory());

        // Tab buttons
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterAchievements(filter);
            });
        });
    }

    async loadGameData() {
        if (this.currentUser) {
            // Load from Firestore
            try {
                const data = await firebaseService.getFallout4Progress(this.currentUser.uid);
                if (data) {
                    this.gameData = data;
                    this.loadData();
                    return;
                }
        } catch (error) {
            console.error('Error loading from Firestore:', error);
            // Show user-friendly message if needed
            if (error.code === 'permission-denied') {
                console.warn('Permission denied. User may need to sign in.');
            }
        }
        }

        // Fallback to localStorage or default
        this.gameData = this.loadGameDataFromLocalStorage();
        this.loadData();
    }

    loadGameDataFromLocalStorage() {
        const saved = localStorage.getItem('fallout4_data');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default game data structure
        return {
            playtime: 0,
            level: 1,
            questsCompleted: 0,
            enemiesKilled: 0,
            locationsDiscovered: 0,
            achievements: this.getDefaultAchievements(),
            mainQuests: this.getDefaultMainQuests(),
            sideQuests: this.getDefaultSideQuests(),
            factions: this.getDefaultFactions(),
            settlements: this.getDefaultSettlements(),
            special: {
                strength: 1,
                perception: 1,
                endurance: 1,
                charisma: 1,
                intelligence: 1,
                agility: 1,
                luck: 1
            },
            combat: {
                damageDealt: 0,
                damageTaken: 0,
                headshots: 0,
                criticalHits: 0,
                vatsKills: 0
            },
            exploration: {
                locationsDiscovered: 0,
                workshopsUnlocked: 0,
                magazinesFound: 0,
                bobbleheadsFound: 0
            }
        };
    }

    async saveGameData() {
        // Save to Firestore if authenticated
        if (this.currentUser) {
            try {
                await firebaseService.saveFallout4Progress(this.currentUser.uid, this.gameData);
            } catch (error) {
                console.error('Error saving to Firestore:', error);
                // Fallback to localStorage
                localStorage.setItem('fallout4_data', JSON.stringify(this.gameData));
                
                let errorMsg = 'Error saving to cloud. Data saved locally.';
                if (error.code === 'permission-denied') {
                    errorMsg = 'Permission denied. Please sign in to save to cloud.';
                } else if (error.code === 'unavailable') {
                    errorMsg = 'Cloud service unavailable. Data saved locally.';
                }
                
                alert(errorMsg);
                return;
            }
        }

        // Also save to localStorage as backup
        localStorage.setItem('fallout4_data', JSON.stringify(this.gameData));
    }

    loadData() {
        this.updateStats();
        this.renderQuests();
        this.renderFactions();
        this.renderSettlements();
        this.renderAchievements();
        this.renderCharacterStats();
    }

    updateStats() {
        this.playtimeEl.textContent = this.formatPlaytime(this.gameData.playtime);
        this.levelEl.textContent = this.gameData.level;
        this.questsCompletedEl.textContent = this.gameData.questsCompleted;
        this.enemiesKilledEl.textContent = this.gameData.enemiesKilled.toLocaleString();
        this.achievementsUnlockedEl.textContent = this.gameData.achievements.filter(a => a.unlocked).length;
        this.locationsDiscoveredEl.textContent = this.gameData.locationsDiscovered;
    }

    formatPlaytime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    handleSaveFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Note: Actual .fos file parsing would require specialized libraries
        // This is a placeholder for the integration
        console.log('Save file selected:', file.name);
        
        // For now, simulate data extraction
        this.simulateSaveFileParsing(file);
    }

    async simulateSaveFileParsing(file) {
        // Simulate parsing save file and updating data
        // In production, this would use a library to parse .fos files
        alert('Save file processing simulated. In production, this would parse the actual .fos file.');
        
        // Simulate some data updates
        this.gameData.level = Math.floor(Math.random() * 50 + 10);
        this.gameData.playtime = Math.floor(Math.random() * 100000 + 10000);
        this.gameData.questsCompleted = Math.floor(Math.random() * 50 + 5);
        
        this.updateStats();
        await this.saveGameData();
    }

    scanSaveDirectory() {
        // Note: Browser security prevents direct file system access
        // This would require a desktop application or browser extension
        alert('Save directory scanning requires a desktop application or browser extension. Use "Select Save File" to manually choose a save file.');
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }

    filterAchievements(filter) {
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        const achievements = this.gameData.achievements;
        let filtered = achievements;

        if (filter === 'unlocked') {
            filtered = achievements.filter(a => a.unlocked);
        } else if (filter === 'locked') {
            filtered = achievements.filter(a => !a.unlocked);
        }

        this.renderAchievements(filtered);
    }

    renderQuests() {
        this.renderMainQuests();
        this.renderSideQuests();
    }

    renderMainQuests() {
        this.mainQuestList.innerHTML = this.gameData.mainQuests.map(quest => `
            <div class="quest-item ${quest.completed ? 'completed' : ''}">
                <div class="quest-info">
                    <h4>${quest.name}</h4>
                    <p>${quest.description}</p>
                </div>
                <span class="quest-status ${quest.completed ? 'status-completed' : quest.started ? 'status-in-progress' : 'status-not-started'}">
                    ${quest.completed ? 'Completed' : quest.started ? 'In Progress' : 'Not Started'}
                </span>
            </div>
        `).join('');
    }

    renderSideQuests() {
        this.sideQuestList.innerHTML = this.gameData.sideQuests.map(quest => `
            <div class="quest-item ${quest.completed ? 'completed' : ''}">
                <div class="quest-info">
                    <h4>${quest.name}</h4>
                    <p>${quest.description}</p>
                </div>
                <span class="quest-status ${quest.completed ? 'status-completed' : quest.started ? 'status-in-progress' : 'status-not-started'}">
                    ${quest.completed ? 'Completed' : quest.started ? 'In Progress' : 'Not Started'}
                </span>
            </div>
        `).join('');
    }

    renderFactions() {
        this.factionList.innerHTML = this.gameData.factions.map(faction => `
            <div class="faction-item ${faction.completed ? 'completed' : ''}">
                <div class="faction-info">
                    <h4>${faction.name}</h4>
                    <p>Reputation: ${faction.reputation}%</p>
                </div>
                <span class="quest-status ${faction.completed ? 'status-completed' : 'status-in-progress'}">
                    ${faction.completed ? 'Completed' : 'In Progress'}
                </span>
            </div>
        `).join('');
    }

    renderSettlements() {
        this.settlementList.innerHTML = this.gameData.settlements.map(settlement => `
            <div class="settlement-item ${settlement.unlocked ? '' : 'completed'}">
                <div class="settlement-info">
                    <h4>${settlement.name}</h4>
                    <p>Population: ${settlement.population} | Happiness: ${settlement.happiness}%</p>
                </div>
                <span class="quest-status ${settlement.unlocked ? 'status-completed' : 'status-not-started'}">
                    ${settlement.unlocked ? 'Unlocked' : 'Locked'}
                </span>
            </div>
        `).join('');
    }

    renderAchievements(achievements = null) {
        const achievementsToRender = achievements || this.gameData.achievements;
        
        this.achievementsGrid.innerHTML = achievementsToRender.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                ${achievement.unlocked && achievement.unlockedDate ? 
                    `<div class="achievement-date">Unlocked: ${new Date(achievement.unlockedDate).toLocaleDateString()}</div>` : 
                    ''}
            </div>
        `).join('');
    }

    renderCharacterStats() {
        // SPECIAL Stats
        this.specialStats.innerHTML = Object.entries(this.gameData.special).map(([stat, value]) => `
            <div class="special-stat">
                <span class="special-stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                <span class="special-stat-value">${value}</span>
            </div>
        `).join('');

        // Combat Stats
        this.combatStats.innerHTML = Object.entries(this.gameData.combat).map(([stat, value]) => `
            <div class="stat-row">
                <span class="stat-row-label">${this.formatStatName(stat)}</span>
                <span class="stat-row-value">${value.toLocaleString()}</span>
            </div>
        `).join('');

        // Exploration Stats
        this.explorationStats.innerHTML = Object.entries(this.gameData.exploration).map(([stat, value]) => `
            <div class="stat-row">
                <span class="stat-row-label">${this.formatStatName(stat)}</span>
                <span class="stat-row-value">${value}</span>
            </div>
        `).join('');
    }

    formatStatName(stat) {
        return stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    getDefaultAchievements() {
        return [
            { name: 'War Never Changes', description: 'Complete "War Never Changes"', icon: '🎯', unlocked: false },
            { name: 'Prepared for the Future', description: 'Complete "Prepared for the Future"', icon: '🔮', unlocked: false },
            { name: 'Nuclear Family', description: 'Complete "Nuclear Family"', icon: '👨‍👩‍👧', unlocked: false },
            { name: 'Institutionalized', description: 'Complete "Institutionalized"', icon: '🏛️', unlocked: false },
            { name: 'The Nuclear Option', description: 'Complete "The Nuclear Option"', icon: '💣', unlocked: false },
            { name: 'Rocket\'s Red Glare', description: 'Complete "Rocket\'s Red Glare"', icon: '🚀', unlocked: false },
            { name: 'The Molecular Level', description: 'Complete "The Molecular Level"', icon: '⚛️', unlocked: false },
            { name: 'Hunter/Hunted', description: 'Complete "Hunter/Hunted"', icon: '🎯', unlocked: false },
            { name: 'The First Step', description: 'Join the Minutemen', icon: '⚔️', unlocked: false },
            { name: 'The Nuclear Option (Institute)', description: 'Complete the Institute ending', icon: '🏛️', unlocked: false },
            { name: 'The Nuclear Option (Brotherhood)', description: 'Complete the Brotherhood ending', icon: '🛡️', unlocked: false },
            { name: 'The Nuclear Option (Railroad)', description: 'Complete the Railroad ending', icon: '🚂', unlocked: false },
            { name: 'Settlement Builder', description: 'Build 10 settlements', icon: '🏗️', unlocked: false },
            { name: 'Wasteland D.I.Y.', description: 'Build 100 items in settlements', icon: '🔨', unlocked: false },
            { name: 'Never Go It Alone', description: 'Recruit 5 companions', icon: '👥', unlocked: false }
        ];
    }

    getDefaultMainQuests() {
        return [
            { name: 'War Never Changes', description: 'Escape Vault 111', completed: false, started: true },
            { name: 'Out of Time', description: 'Find your way to Sanctuary', completed: false, started: false },
            { name: 'When Freedom Calls', description: 'Help Preston and the Minutemen', completed: false, started: false },
            { name: 'Jewel of the Commonwealth', description: 'Reach Diamond City', completed: false, started: false },
            { name: 'Unlikely Valentine', description: 'Find Nick Valentine', completed: false, started: false },
            { name: 'Getting a Clue', description: 'Follow the clues to find your son', completed: false, started: false },
            { name: 'Reunions', description: 'Confront Kellogg', completed: false, started: false },
            { name: 'Dangerous Minds', description: 'Enter Kellogg\'s memories', completed: false, started: false },
            { name: 'The Molecular Level', description: 'Build the signal interceptor', completed: false, started: false },
            { name: 'Institutionalized', description: 'Enter the Institute', completed: false, started: false },
            { name: 'The Nuclear Option', description: 'Destroy the Institute', completed: false, started: false }
        ];
    }

    getDefaultSideQuests() {
        return [
            { name: 'The First Step', description: 'Help the Minutemen at Tenpines Bluff', completed: false, started: false },
            { name: 'Taking Independence', description: 'Help the Minutemen take the Castle', completed: false, started: false },
            { name: 'Tradecraft', description: 'Join the Railroad', completed: false, started: false },
            { name: 'Call to Arms', description: 'Join the Brotherhood of Steel', completed: false, started: false },
            { name: 'The Lost Patrol', description: 'Find the missing Brotherhood patrol', completed: false, started: false },
            { name: 'The Silver Shroud', description: 'Become the Silver Shroud', completed: false, started: false },
            { name: 'The Big Dig', description: 'Help Bobbi No-Nose', completed: false, started: false },
            { name: 'Last Voyage of the U.S.S. Constitution', description: 'Help the robots on the ship', completed: false, started: false }
        ];
    }

    getDefaultFactions() {
        return [
            { name: 'Minutemen', reputation: 0, completed: false },
            { name: 'Brotherhood of Steel', reputation: 0, completed: false },
            { name: 'Railroad', reputation: 0, completed: false },
            { name: 'Institute', reputation: 0, completed: false }
        ];
    }

    getDefaultSettlements() {
        return [
            { name: 'Sanctuary Hills', population: 0, happiness: 0, unlocked: true },
            { name: 'Red Rocket Truck Stop', population: 0, happiness: 0, unlocked: false },
            { name: 'Abernathy Farm', population: 0, happiness: 0, unlocked: false },
            { name: 'Tenpines Bluff', population: 0, happiness: 0, unlocked: false },
            { name: 'The Castle', population: 0, happiness: 0, unlocked: false },
            { name: 'Spectacle Island', population: 0, happiness: 0, unlocked: false }
        ];
    }
}

// Initialize tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Fallout4Tracker();
});