/**
 * Parameterized Odds Calculation Algorithm
 * Calculates match odds based on configurable weights
 */
class OddsAlgorithm {
    constructor() {
        this.weights = {
            rating: 0.40,
            form: 0.25,
            h2h: 0.15,
            map: 0.10,
            live: 0.10
        };
    }

    /**
     * Update algorithm parameters
     * @param {Object} newWeights - New weight values
     */
    updateWeights(newWeights) {
        // Normalize weights to sum to 1.0
        const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
        if (total > 0) {
            Object.keys(newWeights).forEach(key => {
                this.weights[key] = newWeights[key] / total;
            });
        }
    }

    /**
     * Calculate odds for a match
     * @param {Object} match - Match data
     * @param {Object} teamAStats - Team A statistics
     * @param {Object} teamBStats - Team B statistics
     * @returns {Object} Calculated odds and probabilities
     */
    calculateOdds(match, teamAStats = {}, teamBStats = {}) {
        // Get base ratings
        const ratingA = teamAStats.rating || match.teamA.rating || 50;
        const ratingB = teamBStats.rating || match.teamB.rating || 50;

        // Calculate rating factor (40% weight)
        const ratingDiff = ratingA - ratingB;
        const ratingScoreA = 50 + (ratingDiff * this.weights.rating);
        const ratingScoreB = 50 - (ratingDiff * this.weights.rating);

        // Calculate form factor (25% weight)
        const formA = teamAStats.recentForm || 3; // Default to average
        const formB = teamBStats.recentForm || 3;
        const formDiff = formA - formB;
        const formScoreA = 50 + (formDiff * 5 * this.weights.form);
        const formScoreB = 50 - (formDiff * 5 * this.weights.form);

        // Calculate H2H factor (15% weight)
        const h2hA = teamAStats.h2h || 0;
        const h2hB = teamBStats.h2h || 0;
        const h2hDiff = h2hA - h2hB;
        const h2hScoreA = 50 + (h2hDiff * 8 * this.weights.h2h);
        const h2hScoreB = 50 - (h2hDiff * 8 * this.weights.h2h);

        // Calculate map advantage (10% weight)
        let mapScoreA = 50;
        let mapScoreB = 50;
        if (teamAStats.mapAdvantage) {
            mapScoreA = 60;
            mapScoreB = 40;
        } else if (teamBStats.mapAdvantage) {
            mapScoreA = 40;
            mapScoreB = 60;
        }
        const mapScoreAAdj = (mapScoreA - 50) * this.weights.map + 50;
        const mapScoreBAdj = (mapScoreB - 50) * this.weights.map + 50;

        // Calculate live performance (10% weight)
        let liveScoreA = 50;
        let liveScoreB = 50;
        if (match.status === 'live' && match.teamA.score !== undefined && match.teamB.score !== undefined) {
            const scoreDiff = match.teamA.score - match.teamB.score;
            const maxRounds = match.format === 'bo1' ? 16 : match.format === 'bo3' ? 16 : 16;
            const scoreRatio = scoreDiff / maxRounds;
            liveScoreA = 50 + (scoreRatio * 30 * this.weights.live);
            liveScoreB = 50 - (scoreRatio * 30 * this.weights.live);
        }

        // Combine all factors
        let finalScoreA = (ratingScoreA * this.weights.rating) +
                         (formScoreA * this.weights.form) +
                         (h2hScoreA * this.weights.h2h) +
                         (mapScoreAAdj * this.weights.map) +
                         (liveScoreA * this.weights.live);

        let finalScoreB = (ratingScoreB * this.weights.rating) +
                         (formScoreB * this.weights.form) +
                         (h2hScoreB * this.weights.h2h) +
                         (mapScoreBAdj * this.weights.map) +
                         (liveScoreB * this.weights.live);

        // Normalize to probabilities
        const total = finalScoreA + finalScoreB;
        let probA = (finalScoreA / total) * 100;
        let probB = (finalScoreB / total) * 100;

        // Ensure probabilities are within bounds
        probA = Math.max(5, Math.min(95, probA));
        probB = Math.max(5, Math.min(95, probB));

        // Re-normalize
        const sum = probA + probB;
        probA = (probA / sum) * 100;
        probB = (probB / sum) * 100;

        // Calculate decimal odds
        const oddsA = (100 / probA).toFixed(2);
        const oddsB = (100 / probB).toFixed(2);

        // Calculate confidence
        const diff = Math.abs(probA - probB);
        let confidence = 'Very Low';
        if (diff >= 20) confidence = 'Very High';
        else if (diff >= 15) confidence = 'High';
        else if (diff >= 10) confidence = 'Moderate';
        else if (diff >= 5) confidence = 'Low';

        return {
            teamA: {
                probability: Math.round(probA * 10) / 10,
                odds: parseFloat(oddsA),
                score: finalScoreA
            },
            teamB: {
                probability: Math.round(probB * 10) / 10,
                odds: parseFloat(oddsB),
                score: finalScoreB
            },
            confidence: confidence,
            difference: Math.round(diff * 10) / 10
        };
    }

    /**
     * Get current weights
     * @returns {Object} Current weight configuration
     */
    getWeights() {
        return { ...this.weights };
    }
}