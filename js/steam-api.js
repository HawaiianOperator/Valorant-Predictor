/**
 * Steam API Integration
 * Handles live match tracking via Steam API
 */
class SteamAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.steampowered.com';
    }

    /**
     * Get user's Steam ID from profile URL or ID
     * @param {string} input - Steam ID or profile URL
     * @returns {Promise<string>} Steam ID
     */
    async resolveSteamId(input) {
        // If it's already a Steam ID (numeric)
        if (/^\d+$/.test(input)) {
            return input;
        }

        // If it's a profile URL, extract the ID
        const profileMatch = input.match(/steamcommunity\.com\/profiles\/(\d+)/);
        if (profileMatch) {
            return profileMatch[1];
        }

        // Try to resolve vanity URL
        const vanityMatch = input.match(/steamcommunity\.com\/id\/([^\/]+)/);
        if (vanityMatch) {
            return await this.resolveVanityURL(vanityMatch[1]);
        }

        throw new Error('Invalid Steam ID or profile URL');
    }

    /**
     * Resolve vanity URL to Steam ID
     * @param {string} vanityUrl - Vanity URL name
     * @returns {Promise<string>} Steam ID
     */
    async resolveVanityURL(vanityUrl) {
        try {
            const url = `${this.baseURL}/ISteamUser/ResolveVanityURL/v0001/?key=${this.apiKey}&vanityurl=${vanityUrl}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.response && data.response.steamid) {
                return data.response.steamid;
            }
            throw new Error('Vanity URL not found');
        } catch (error) {
            console.error('Error resolving vanity URL:', error);
            throw error;
        }
    }

    /**
     * Get player's game info
     * @param {string} steamId - Steam ID
     * @returns {Promise<Object>} Game info
     */
    async getPlayerGameInfo(steamId) {
        try {
            const url = `${this.baseURL}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.response && data.response.players && data.response.players[0]) {
                return data.response.players[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching player info:', error);
            return null;
        }
    }

    /**
     * Get live matches (mock implementation - Steam API doesn't directly provide this)
     * In production, this would integrate with CS2 game state API or third-party services
     * @returns {Promise<Array>} Live matches
     */
    async getLiveMatches() {
        try {
            // Note: Steam API doesn't have a direct endpoint for live CS2 matches
            // This would typically require:
            // 1. Game state integration
            // 2. Third-party match tracking services
            // 3. WebSocket connections to game servers
            
            // For now, return mock data
            return this.getMockLiveMatches();
        } catch (error) {
            console.error('Error fetching live matches:', error);
            return [];
        }
    }

    /**
     * Mock live matches for development
     */
    getMockLiveMatches() {
        const teams = [
            ['FaZe Clan', 'NAVI'],
            ['G2 Esports', 'Team Liquid'],
            ['Vitality', 'MOUZ'],
            ['Heroic', 'Cloud9']
        ];

        return teams.map(([teamA, teamB], index) => ({
            id: `match_${Date.now()}_${index}`,
            teamA: {
                name: teamA,
                score: Math.floor(Math.random() * 16),
                rating: Math.floor(Math.random() * 30 + 70)
            },
            teamB: {
                name: teamB,
                score: Math.floor(Math.random() * 16),
                rating: Math.floor(Math.random() * 30 + 70)
            },
            map: ['Dust2', 'Mirage', 'Inferno', 'Overpass', 'Nuke'][Math.floor(Math.random() * 5)],
            status: 'live',
            startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            format: 'bo3',
            currentRound: Math.floor(Math.random() * 30 + 1)
        }));
    }

    /**
     * Check if API key is valid
     * @returns {Promise<boolean>}
     */
    async validateAPIKey() {
        if (!this.apiKey) {
            return false;
        }

        try {
            // Simple validation by trying to use the API
            const url = `${this.baseURL}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=76561197960435530`;
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}