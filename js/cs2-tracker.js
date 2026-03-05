/**
 * Main CS2 Tracker Application
 * Coordinates API calls, odds calculation, and UI updates
 */
class CS2Tracker {
    constructor() {
        this.leetifyAPI = null;
        this.steamAPI = null;
        this.oddsAlgorithm = new OddsAlgorithm();
        this.currentMatches = [];
        this.refreshInterval = null;
        this.currentUser = null;
        this.liveMatchSubscriptions = {};
        
        this.initializeElements();
        this.setupAuthListener();
        this.attachEventListeners();
    }

    setupAuthListener() {
        authService.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                await this.loadSettingsFromFirestore();
            } else {
                // Clear UI when signed out
                this.leetifyApiInput.value = '';
                this.steamApiInput.value = '';
                this.steamIdInput.value = '';
            }
        });
    }

    initializeElements() {
        // API inputs
        this.leetifyApiInput = document.getElementById('leetify-api');
        this.steamApiInput = document.getElementById('steam-api');
        this.steamIdInput = document.getElementById('steam-id');
        this.connectBtn = document.getElementById('connect-btn');

        // Parameter sliders
        this.ratingWeight = document.getElementById('rating-weight');
        this.formWeight = document.getElementById('form-weight');
        this.h2hWeight = document.getElementById('h2h-weight');
        this.mapWeight = document.getElementById('map-weight');
        this.liveWeight = document.getElementById('live-weight');

        // Parameter value displays
        this.ratingValue = document.getElementById('rating-value');
        this.formValue = document.getElementById('form-value');
        this.h2hValue = document.getElementById('h2h-value');
        this.mapValue = document.getElementById('map-value');
        this.liveValue = document.getElementById('live-value');

        // Buttons
        this.updateParamsBtn = document.getElementById('update-params-btn');
        this.refreshMatchesBtn = document.getElementById('refresh-matches-btn');

        // Containers
        this.matchesContainer = document.getElementById('matches-container');
        this.matchModal = document.getElementById('match-modal');
        this.matchDetails = document.getElementById('match-details');
    }

    attachEventListeners() {
        // Parameter sliders
        this.ratingWeight.addEventListener('input', () => {
            this.ratingValue.textContent = `${this.ratingWeight.value}%`;
        });
        this.formWeight.addEventListener('input', () => {
            this.formValue.textContent = `${this.formWeight.value}%`;
        });
        this.h2hWeight.addEventListener('input', () => {
            this.h2hValue.textContent = `${this.h2hWeight.value}%`;
        });
        this.mapWeight.addEventListener('input', () => {
            this.mapValue.textContent = `${this.mapWeight.value}%`;
        });
        this.liveWeight.addEventListener('input', () => {
            this.liveValue.textContent = `${this.liveWeight.value}%`;
        });

        // Buttons
        this.updateParamsBtn.addEventListener('click', () => this.updateParameters());
        this.connectBtn.addEventListener('click', () => this.connectAPIs());
        this.refreshMatchesBtn.addEventListener('click', () => this.loadMatches());

        // Modal close
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.matchModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === this.matchModal) {
                this.matchModal.style.display = 'none';
            }
        });

        // Load saved settings (will be loaded from Firestore if authenticated)
        this.loadSavedKeys();
    }

    async loadSavedKeys() {
        // Try to load from localStorage first (for migration)
        const leetifyKey = localStorage.getItem('leetify_api_key');
        const steamKey = localStorage.getItem('steam_api_key');
        const steamId = localStorage.getItem('steam_id');

        if (leetifyKey) this.leetifyApiInput.value = leetifyKey;
        if (steamKey) this.steamApiInput.value = steamKey;
        if (steamId) this.steamIdInput.value = steamId;

        // Load saved parameters
        const savedWeights = localStorage.getItem('odds_weights');
        if (savedWeights) {
            const weights = JSON.parse(savedWeights);
            this.oddsAlgorithm.updateWeights(weights);
            this.updateParameterSliders();
        }
    }

    async loadSettingsFromFirestore() {
        if (!this.currentUser) return;

        try {
            const settings = await firebaseService.getCS2Settings(this.currentUser.uid);
            if (settings) {
                // Load API keys
                if (settings.leetifyApiKey) this.leetifyApiInput.value = settings.leetifyApiKey;
                if (settings.steamApiKey) this.steamApiInput.value = settings.steamApiKey;
                if (settings.steamId) this.steamIdInput.value = settings.steamId;

                // Load algorithm weights
                if (settings.oddsWeights) {
                    this.oddsAlgorithm.updateWeights(settings.oddsWeights);
                    this.updateParameterSliders();
                }

                // Initialize APIs if keys are available
                if (settings.steamApiKey) {
                    this.steamAPI = new SteamAPI(settings.steamApiKey);
                    if (settings.leetifyApiKey) {
                        this.leetifyAPI = new LeetifyAPI(settings.leetifyApiKey);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading settings from Firestore:', error);
        }
    }

    updateParameterSliders() {
        const weights = this.oddsAlgorithm.getWeights();
        this.ratingWeight.value = Math.round(weights.rating * 100);
        this.formWeight.value = Math.round(weights.form * 100);
        this.h2hWeight.value = Math.round(weights.h2h * 100);
        this.mapWeight.value = Math.round(weights.map * 100);
        this.liveWeight.value = Math.round(weights.live * 100);

        this.ratingValue.textContent = `${this.ratingWeight.value}%`;
        this.formValue.textContent = `${this.formWeight.value}%`;
        this.h2hValue.textContent = `${this.h2hWeight.value}%`;
        this.mapValue.textContent = `${this.mapWeight.value}%`;
        this.liveValue.textContent = `${this.liveWeight.value}%`;
    }

    async connectAPIs() {
        if (!this.currentUser) {
            alert('Please sign in to save your API keys');
            return;
        }

        const leetifyKey = this.leetifyApiInput.value.trim();
        const steamKey = this.steamApiInput.value.trim();
        const steamId = this.steamIdInput.value.trim();

        if (!steamKey) {
            alert('Please enter a Steam API key');
            return;
        }

        // Initialize APIs
        this.leetifyAPI = new LeetifyAPI(leetifyKey);
        this.steamAPI = new SteamAPI(steamKey);

        // Validate Steam API
        const isValid = await this.steamAPI.validateAPIKey();
        if (!isValid) {
            alert('Steam API key validation failed. Please check your key.');
            return;
        }

        // Resolve Steam ID if needed
        if (steamId) {
            try {
                const resolvedId = await this.steamAPI.resolveSteamId(steamId);
                console.log('Resolved Steam ID:', resolvedId);
            } catch (error) {
                console.error('Error resolving Steam ID:', error);
            }
        }

        // Save to Firestore
        try {
            await firebaseService.saveCS2Settings(this.currentUser.uid, {
                leetifyApiKey: leetifyKey || null,
                steamApiKey: steamKey,
                steamId: steamId || null
            });
        } catch (error) {
            console.error('Error saving settings to Firestore:', error);
            alert('Error saving settings. Please try again.');
            return;
        }

        // Also save to localStorage as backup
        if (leetifyKey) localStorage.setItem('leetify_api_key', leetifyKey);
        if (steamKey) localStorage.setItem('steam_api_key', steamKey);
        if (steamId) localStorage.setItem('steam_id', steamId);

        alert('APIs connected successfully!');
        this.loadMatches();
    }

    async updateParameters() {
        const newWeights = {
            rating: parseInt(this.ratingWeight.value) / 100,
            form: parseInt(this.formWeight.value) / 100,
            h2h: parseInt(this.h2hWeight.value) / 100,
            map: parseInt(this.mapWeight.value) / 100,
            live: parseInt(this.liveWeight.value) / 100
        };

        this.oddsAlgorithm.updateWeights(newWeights);

        // Save to Firestore if authenticated
        if (this.currentUser) {
            try {
                await firebaseService.saveCS2Settings(this.currentUser.uid, {
                    oddsWeights: newWeights
                });
            } catch (error) {
                console.error('Error saving parameters to Firestore:', error);
                alert('Error saving parameters. Using local values.');
            }
        }

        // Also save to localStorage as backup
        localStorage.setItem('odds_weights', JSON.stringify(newWeights));

        // Recalculate odds for current matches
        this.displayMatches(this.currentMatches);

        alert('Parameters updated successfully!');
    }

    async loadMatches() {
        this.matchesContainer.innerHTML = '<div class="loading">Loading live matches...</div>';

        try {
            let matches = [];

            if (this.steamAPI) {
                matches = await this.steamAPI.getLiveMatches();
            } else {
                // Use mock data if no API
                const mockSteam = new SteamAPI('mock');
                matches = mockSteam.getMockLiveMatches();
            }

            this.currentMatches = matches;
            this.displayMatches(matches);

            // Set up auto-refresh
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            this.refreshInterval = setInterval(() => this.loadMatches(), 30000); // Refresh every 30 seconds

        } catch (error) {
            console.error('Error loading matches:', error);
            const errorMessage = error.message || 'Failed to load matches. Please check your connection and try again.';
            this.matchesContainer.innerHTML = `<div class="error">Error loading matches: ${errorMessage}</div>`;
        }
    }

    displayMatches(matches) {
        if (matches.length === 0) {
            this.matchesContainer.innerHTML = '<div class="error">No live matches found</div>';
            return;
        }

        this.matchesContainer.innerHTML = '';

        matches.forEach(match => {
            const odds = this.oddsAlgorithm.calculateOdds(match);
            const matchCard = this.createMatchCard(match, odds);
            this.matchesContainer.appendChild(matchCard);
        });
    }

    createMatchCard(match, odds) {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.addEventListener('click', () => this.showMatchDetails(match));

        const statusClass = `status-${match.status}`;
        const statusText = match.status.charAt(0).toUpperCase() + match.status.slice(1);

        card.innerHTML = `
            <div class="match-header">
                <div class="match-teams">
                    <span class="team-name">${match.teamA.name}</span>
                    <span class="vs-divider">VS</span>
                    <span class="team-name">${match.teamB.name}</span>
                </div>
                <span class="match-status ${statusClass}">${statusText}</span>
            </div>
            <div class="match-info">
                <span>Map: ${match.map}</span>
                <span>Format: ${match.format.toUpperCase()}</span>
                ${match.status === 'live' ? `<span>Round: ${match.currentRound}</span>` : ''}
            </div>
            ${match.status === 'live' ? `
                <div class="match-score" style="margin: 1rem 0; font-size: 1.5rem; text-align: center;">
                    <span>${match.teamA.score}</span> - <span>${match.teamB.score}</span>
                </div>
            ` : ''}
            <div class="match-odds">
                <div class="odds-item">
                    <div class="odds-label">${match.teamA.name}</div>
                    <div class="odds-value">${odds.teamA.probability}%</div>
                    <div class="odds-label" style="font-size: 0.8rem;">Odds: ${odds.teamA.odds.toFixed(2)}</div>
                </div>
                <div class="odds-item">
                    <div class="odds-label">${match.teamB.name}</div>
                    <div class="odds-value">${odds.teamB.probability}%</div>
                    <div class="odds-label" style="font-size: 0.8rem;">Odds: ${odds.teamB.odds.toFixed(2)}</div>
                </div>
            </div>
            <div style="margin-top: 1rem; text-align: center; color: var(--text-light); font-size: 0.9rem;">
                Confidence: <strong style="color: var(--primary-color);">${odds.confidence}</strong>
            </div>
        `;

        return card;
    }

    async showMatchDetails(match) {
        this.matchModal.style.display = 'block';
        this.matchDetails.innerHTML = '<div class="loading">Loading match details...</div>';

        try {
            // Subscribe to live match updates if match is live
            if (match.status === 'live' && match.id) {
                this.subscribeToLiveMatch(match.id);
            }

            // Get detailed match data
            let matchData = match;
            if (this.leetifyAPI) {
                const details = await this.leetifyAPI.getMatchDetails(match.id);
                matchData = { ...match, ...details };
            }

            // Save match to history if user is authenticated
            if (this.currentUser && matchData) {
                try {
                    await firebaseService.saveMatch(this.currentUser.uid, {
                        matchId: match.id || matchData.id,
                        teamA: matchData.teamA,
                        teamB: matchData.teamB,
                        map: matchData.map,
                        status: matchData.status,
                        format: matchData.format,
                        players: matchData.players || [],
                        odds: this.oddsAlgorithm.calculateOdds(matchData)
                    });
                } catch (error) {
                    console.error('Error saving match to Firestore:', error);
                }
            }

            // Calculate odds
            const odds = this.oddsAlgorithm.calculateOdds(matchData);

            // Get player stats
            const players = matchData.players || [];

            // Display details
            this.matchDetails.innerHTML = `
                <h2 style="color: var(--primary-color); margin-bottom: 1rem;">${match.teamA.name} vs ${match.teamB.name}</h2>
                <div style="margin-bottom: 2rem;">
                    <p><strong>Map:</strong> ${match.map}</p>
                    <p><strong>Format:</strong> ${match.format.toUpperCase()}</p>
                    <p><strong>Status:</strong> ${match.status}</p>
                    ${match.status === 'live' ? `<p><strong>Current Score:</strong> ${match.teamA.score} - ${match.teamB.score}</p>` : ''}
                </div>

                <div class="match-odds" style="margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <div class="odds-item">
                        <div class="odds-label">${match.teamA.name}</div>
                        <div class="odds-value" style="font-size: 2rem;">${odds.teamA.probability}%</div>
                        <div class="odds-label" style="margin-top: 0.5rem;">Decimal Odds: ${odds.teamA.odds.toFixed(2)}</div>
                    </div>
                    <div class="odds-item">
                        <div class="odds-label">${match.teamB.name}</div>
                        <div class="odds-value" style="font-size: 2rem;">${odds.teamB.probability}%</div>
                        <div class="odds-label" style="margin-top: 0.5rem;">Decimal Odds: ${odds.teamB.odds.toFixed(2)}</div>
                    </div>
                </div>

                ${players.length > 0 ? `
                    <div class="player-stats-grid">
                        <div class="team-stats">
                            <h3>${match.teamA.name}</h3>
                            ${this.renderPlayerStats(players.filter(p => p.team === 'A'))}
                        </div>
                        <div class="team-stats">
                            <h3>${match.teamB.name}</h3>
                            ${this.renderPlayerStats(players.filter(p => p.team === 'B'))}
                        </div>
                    </div>
                ` : '<p style="color: var(--text-light);">Player statistics not available</p>'}
            `;
        } catch (error) {
            console.error('Error loading match details:', error);
            const errorMessage = error.message || 'Failed to load match details. Please try again.';
            this.matchDetails.innerHTML = `<div class="error">Error loading match details: ${errorMessage}</div>`;
        }
    }

    renderPlayerStats(players) {
        if (players.length === 0) {
            return '<p style="color: var(--text-light);">No player data available</p>';
        }

        return players.map(player => `
            <div class="player-card">
                <div class="player-name">${player.name}</div>
                <div class="stat-row">
                    <span class="stat-label">KDR:</span>
                    <span class="stat-value">${player.kdr}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">ADR:</span>
                    <span class="stat-value">${player.adr}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time to Damage:</span>
                    <span class="stat-value">${player.timeToDamage}s</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Load Time:</span>
                    <span class="stat-value">${player.loadTime}s</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Kills:</span>
                    <span class="stat-value">${player.kills}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Deaths:</span>
                    <span class="stat-value">${player.deaths}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Assists:</span>
                    <span class="stat-value">${player.assists}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Headshots:</span>
                    <span class="stat-value">${player.headshots}</span>
                </div>
            </div>
        `).join('');
    }

    subscribeToLiveMatch(matchId) {
        // Unsubscribe from previous subscription if exists
        if (this.liveMatchSubscriptions[matchId]) {
            firebaseService.unsubscribeFromLiveMatch(matchId, this.liveMatchSubscriptions[matchId]);
        }

        // Subscribe to live match updates
        try {
            const unsubscribe = firebaseService.subscribeToLiveMatch(matchId, (matchData) => {
                if (matchData) {
                    // Update match details if modal is open
                    const currentMatch = this.currentMatches.find(m => m.id === matchId);
                    if (currentMatch) {
                        Object.assign(currentMatch, matchData);
                        // Refresh display if this match is currently being viewed
                        if (this.matchModal.style.display === 'block') {
                            this.showMatchDetails(currentMatch);
                        }
                    }
                }
            });
            this.liveMatchSubscriptions[matchId] = unsubscribe;
        } catch (error) {
            console.error('Error subscribing to live match:', error);
        }
    }
}

// Initialize tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CS2Tracker();
});