/**
 * Valorant API (stub)
 *
 * Riot does not provide an official public "match history + round events" API for everyone.
 * Tracker-style sites typically use a licensed Riot program and/or third-party providers.
 *
 * This file provides a small interface you can later wire to a real provider.
 */

class ValorantAPI {
  constructor({ apiKey = null } = {}) {
    this.apiKey = apiKey;
  }

  async getMatchesByRiotId(_riotId) {
    return [];
  }

  getMockMatch() {
    // Minimal schema for the round review UI.
    return {
      metadata: {
        matchId: "mock-valorant-match",
        map: "Ascent",
        mode: "Competitive",
        startedAt: new Date().toISOString()
      },
      rounds: [
        {
          number: 1,
          winner: "Attack",
          spikePlanted: true,
          kills: [
            { time: "01:21", killer: "You", victim: "Enemy1", weapon: "Vandal", hs: true }
          ],
          damage: [
            { time: "01:22", from: "You", to: "Enemy2", amount: 78, body: "Body" }
          ]
        },
        {
          number: 2,
          winner: "Defense",
          spikePlanted: false,
          kills: [
            { time: "00:48", killer: "Enemy3", victim: "You", weapon: "Phantom", hs: false }
          ],
          damage: [
            { time: "00:47", from: "You", to: "Enemy3", amount: 40, body: "Leg" }
          ]
        }
      ]
    };
  }
}

