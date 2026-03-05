# CS2 Tracker Network

A comprehensive web application for tracking CS2 matches and Fallout 4 gameplay progress.

## Features

### CS2 Match Tracker
- **Live Match Tracking**: Real-time tracking of CS2 matches with live odds calculation
- **Leetify Integration**: Pulls match data and player statistics from Leetify.com
- **Steam API Integration**: Connects to Steam API for live match data
- **Parameterized Odds Algorithm**: Fully customizable algorithm with adjustable weights for:
  - Team Rating (default: 40%)
  - Recent Form (default: 25%)
  - Head-to-Head (default: 15%)
  - Map Advantage (default: 10%)
  - Live Performance (default: 10%)
- **Comprehensive Player Stats**: Displays:
  - KDR (Kill/Death Ratio)
  - ADR (Average Damage per Round)
  - Time to Damage
  - Load Time
  - Kills, Deaths, Assists
  - Headshots
  - Opponent information

### Fallout 4 Progress Tracker
- **Progress Tracking**: Monitor main quests, side quests, factions, and settlements
- **Achievement System**: Track all Fallout 4 achievements with unlock status
- **Character Statistics**: View SPECIAL stats, combat stats, and exploration stats
- **Save File Integration**: Connect to Fallout 4 save files (.fos) for automatic progress updates
- **Statistics Overview**: Track playtime, level, quests completed, enemies killed, and more

## Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Steam API key (for CS2 live match tracking)
- Optional: Leetify API key (for enhanced CS2 statistics)

### Getting a Steam API Key
1. Go to https://steamcommunity.com/dev/apikey
2. Register for a Steam Web API Key
3. Enter your API key in the CS2 Tracker page

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. No build process or server required - runs entirely client-side

## Usage

### CS2 Tracker
1. Navigate to the CS2 Tracker page
2. Enter your Steam API key (required for live matches)
3. Optionally enter a Leetify API key for enhanced statistics
4. Enter your Steam ID or profile URL
5. Click "Connect" to initialize the APIs
6. Adjust algorithm parameters using the sliders
7. Click "Update Parameters" to apply changes
8. View live matches and their calculated odds
9. Click on any match to see detailed player statistics

### Fallout 4 Tracker
1. Navigate to the Fallout 4 Tracker page
2. Optionally select a save file (.fos) to import progress
3. View your statistics, quest progress, achievements, and character stats
4. Use tabs to navigate between different progress categories
5. Filter achievements by status (All, Unlocked, Locked)

## File Structure

```
├── index.html                  # Homepage
├── cs2-tracker.html           # CS2 match tracking page
├── fallout4-tracker.html      # Fallout 4 progress tracking page
├── styles/
│   ├── main.css              # Main stylesheet (shared)
│   ├── cs2-tracker.css       # CS2 tracker specific styles
│   └── fallout4-tracker.css  # Fallout 4 tracker specific styles
├── js/
│   ├── leetify-api.js        # Leetify API integration
│   ├── steam-api.js          # Steam API integration
│   ├── odds-algorithm.js     # Parameterized odds calculation
│   ├── cs2-tracker.js         # CS2 tracker main logic
│   └── fallout4-tracker.js   # Fallout 4 tracker main logic
└── README.md                  # This file
```

## API Integration Notes

### Leetify API
- The Leetify API integration is structured to work with their API endpoints
- Actual endpoints may vary - check Leetify.com API documentation
- The code includes mock data fallbacks for development/testing
- Some endpoints may require authentication

### Steam API
- Requires a valid Steam Web API key
- Used for resolving Steam IDs and fetching player information
- Live match data may require additional integration (game state API, third-party services)
- The code includes mock data for development when API is unavailable

## Algorithm Details

The odds calculation algorithm uses weighted factors:

1. **Team Rating**: Overall team skill level (0-100 scale)
2. **Recent Form**: Performance in last 5 matches
3. **Head-to-Head**: Historical matchup advantage
4. **Map Advantage**: Map familiarity and preference
5. **Live Performance**: Current match performance (for live matches)

All weights are adjustable via the UI and are normalized to sum to 100%.

## Browser Storage

The application uses localStorage to save:
- API keys (Steam, Leetify)
- Algorithm parameters
- Fallout 4 progress data

All data is stored locally in your browser - no server required.

## Limitations

- **CS2 Live Matches**: Full live match tracking requires game state integration or third-party services beyond basic Steam API
- **Fallout 4 Save Files**: Actual .fos file parsing requires specialized libraries (currently simulated)
- **Browser Security**: Direct file system access for save file scanning requires desktop app or browser extension
- **CORS**: Some API calls may be blocked by CORS policies - may require proxy or backend service

## Future Enhancements

- Real-time WebSocket connections for live match updates
- Actual .fos file parsing library integration
- Export/import functionality for progress data
- Historical match analysis and trends
- Advanced statistics and analytics
- Mobile app version

## License

This project is provided as-is for personal use.

## Credits

- Data sources: Leetify.com, Steam API
- Game: Counter-Strike 2, Fallout 4