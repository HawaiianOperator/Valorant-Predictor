/**
 * Leetify API Integration
 * Handles data fetching from Leetify.com
 */
class LeetifyAPI {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.leetify.com/api';
        // Note: Leetify may require authentication or have different endpoints
        // This is a structure that can be adapted based on actual API documentation
    }

    /**
     * Fetch match data for a player
     * @param {string} steamId - Steam ID of the player
     * @returns {Promise<Object>} Match data
     */
    async getPlayerMatches(steamId) {
        try {
            // This is a placeholder - actual endpoint may vary
            const url = `${this.baseURL}/matches/${steamId}`;
            const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
            
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                throw new Error(`Leetify API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching Leetify data:', error);
            // Return mock data for development
            return this.getMockMatchData();
        }
    }

    /**
     * Get player statistics
     * @param {string} steamId - Steam ID
     * @returns {Promise<Object>} Player stats
     */
    async getPlayerStats(steamId) {
        try {
            const url = `${this.baseURL}/stats/${steamId}`;
            const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
            
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                throw new Error(`Leetify API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching player stats:', error);
            return this.getMockPlayerStats();
        }
    }

    /**
     * Get match details
     * @param {string} matchId - Match ID
     * @returns {Promise<Object>} Match details
     */
    async getMatchDetails(matchId) {
        try {
            const url = `${this.baseURL}/matches/${matchId}`;
            const headers = this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {};
            
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                throw new Error(`Leetify API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching match details:', error);
            return this.getMockMatchDetails(matchId);
        }
    }

    /**
     * Mock data for development/testing
     */
    getMockMatchData() {
        return {
            matches: [
                {
                    id: 'match1',
                    date: new Date().toISOString(),
                    map: 'Dust2',
                    score: { teamA: 16, teamB: 12 },
                    players: this.generateMockPlayers()
                }
            ]
        };
    }

    getMockPlayerStats() {
        return {
            kdr: 1.25,
            adr: 85.5,
            timeToDamage: 0.45,
            headshotPercentage: 52.3,
            winRate: 58.2
        };
    }

    getMockMatchDetails(matchId) {
        return {
            id: matchId,
            date: new Date().toISOString(),
            map: 'Mirage',
            score: { teamA: 16, teamB: 14 },
            duration: 3600,
            players: this.generateMockPlayers(),
            rounds: this.generateMockRounds()
        };
    }

    generateMockPlayers() {
        const players = [];
        for (let i = 0; i < 10; i++) {
            players.push({
                steamId: `steam_${i}`,
                name: `Player ${i + 1}`,
                team: i < 5 ? 'A' : 'B',
                kdr: (Math.random() * 2 + 0.5).toFixed(2),
                adr: Math.floor(Math.random() * 100 + 50),
                timeToDamage: (Math.random() * 0.5 + 0.2).toFixed(2),
                kills: Math.floor(Math.random() * 30 + 10),
                deaths: Math.floor(Math.random() * 25 + 5),
                assists: Math.floor(Math.random() * 15),
                headshots: Math.floor(Math.random() * 20),
                loadTime: (Math.random() * 2 + 0.5).toFixed(2)
            });
        }
        return players;
    }

    generateMockRounds() {
        const rounds = [];
        for (let i = 0; i < 30; i++) {
            rounds.push({
                round: i + 1,
                winner: i % 2 === 0 ? 'A' : 'B',
                duration: Math.floor(Math.random() * 120 + 30)
            });
        }
        return rounds;
    }
}