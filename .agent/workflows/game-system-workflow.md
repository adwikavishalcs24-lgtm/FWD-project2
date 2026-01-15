---
description: Complete Game System Workflow and Architecture
---

# Time Travel Tycoon - Complete Game System Workflow

## 🎮 GAME ARCHITECTURE OVERVIEW

### Core Technology Stack
- **Frontend**: React + Zustand (state management) + Framer Motion (animations)
- **Backend**: Express.js + SQLite
- **Authentication**: JWT tokens
- **API Communication**: RESTful endpoints

---

## 🔐 1. AUTHENTICATION & SESSION FLOW

### User Login/Registration
```
1. User enters credentials → Frontend (Login/Register page)
2. Frontend calls authAPI.login() or authAPI.register()
3. Backend validates credentials → Returns JWT token + user data
4. Frontend stores token in localStorage via tokenUtils.saveToken()
5. gameStore sets isAuthenticated = true, currentUser = userData
6. App navigates to /dashboard
```

### Session Management
```
1. On app startup (App.jsx useEffect):
   - initializeAuth() is called
   - Checks localStorage for existing token
   - If token exists and is valid:
     * Calls authAPI.getCurrentUser() to verify
     * Calls loadGameSession() to restore game state
     * Syncs credits, resources, missions, upgrades from backend
   - If no token or invalid:
     * Sets isAuthenticated = false
     * Shows login screen
```

---

## 💾 2. GAME STATE PERSISTENCE SYSTEM

### State Storage Locations
1. **Frontend (Zustand Store)**: Temporary, in-memory state
2. **Backend Database (SQLite)**: Permanent storage in `game_sessions` table

### Database Schema (game_sessions)
```sql
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER,
  credits: INTEGER,
  energy: INTEGER,
  stability: INTEGER,
  score: INTEGER,
  game_state: TEXT (JSON containing):
    - resources: { past: {...}, present: {...}, future: {...} }
    - completedMissions: [1, 2, 3...]
    - purchasedUpgrades: ['upgrade1', 'upgrade2'...]
  total_mini_games_played: INTEGER,
  total_credits_earned: INTEGER,
  time_played_seconds: INTEGER,
  is_active: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Sync Flow: Frontend ↔ Backend
```
SAVE TO BACKEND:
1. User performs action (buy upgrade, complete mission, etc.)
2. Frontend updates local Zustand state immediately (optimistic update)
3. Frontend calls updateGameSession(updates)
4. Check if token exists (skip if no token = offline mode)
5. Backend receives PUT /api/game/session
6. Backend updates database via gameSessionDB.update()
7. Backend returns updated session object
8. Frontend calls syncGameState() to ensure consistency

LOAD FROM BACKEND:
1. User logs in or refreshes page
2. Frontend calls loadGameSession()
3. Backend queries database for active session
4. Backend returns session data
5. Frontend calls syncGameState(sessionData)
6. Helpers extract data from multiple possible locations:
   - credits from sessionData.credits
   - resources from sessionData.gameState.resources
   - missions from sessionData.gameState.completedMissions
   - upgrades from sessionData.gameState.purchasedUpgrades
7. Zustand state is updated with real values
```

---

## 💰 3. CREDITS & ECONOMY SYSTEM

### How Credits Work
```
EARNING CREDITS:
1. Complete mini-games → Earn score × 10 credits (via rewards.credits)
2. Complete missions → Earn mission.reward credits
3. Dashboard "SAVE PROGRESS" button → Adds 1000 credits (testing feature)

SPENDING CREDITS:
1. Time Machine upgrades → Costs vary (500₵ to 5000₵)
2. Dashboard shop items → 1000₵ to 3000₵ per item
3. Build actions in Era screens → 300₵ to 1200₵

PERSISTENCE:
- Credits immediately saved to backend after any change
- Stored in game_sessions.credits column
- Synchronized on every page load/navigation
```

### Credit Flow Example: Buying an Upgrade
```
User clicks "INSTALL" on Time Machine upgrade:
1. TimeMachine.jsx → handlePurchase(upgrade)
2. Calls purchaseUpgrade(upgradeId, cost)
3. gameStore checks: if (credits < cost) return false
4. Calculates: newCredits = credits - cost
5. Updates local state immediately:
   set({ credits: newCredits, purchasedUpgrades: [...old, upgradeId] })
6. Calls updateGameSession({
     credits: newCredits,
     gameState: { purchasedUpgrades: newUpgrades }
   })
7. Backend saves to database
8. User sees updated credits instantly (optimistic UI)
```

---

## 🎯 4. MISSIONS SYSTEM

### Mission Flow
```
1. User navigates to /missions page (MissionsPage component)
2. Sees list of 5 missions, each linked to a specific mini-game:
   - Mission 1 (clockmaker) → Past Era
   - Mission 2 (blacksmith) → Past Era
   - Mission 3 (rift) → Future Era
   - Mission 4 (traffic) → Present Era
   - Mission 5 (defense) → Future Era

3. User clicks "ACCEPT MISSION":
   - Navigate to era page (e.g., /past)
   - Pass state: { showGames: true, autoStartGameId: 'clockmaker' }
   - EraScreen auto-opens the mini-game modal

4. User plays mini-game

5. On game completion (handleMiniGameComplete):
   - completeMiniGame() is called
   - Checks missionMapping: { 'clockmaker': 1, 'blacksmith': 2, ... }
   - If gameId matches a mission, adds missionId to completedMissions
   - Updates backend with new completedMissions array

6. Mission marked as completed:
   - Stored in game_sessions.game_state.completedMissions
   - Synced on page load
   - MissionsPage shows "COMPLETED" badge
```

---

## 🎮 5. MINI-GAMES SYSTEM

### Available Mini-Games
```
PAST ERA:
- Clockmaker (align clocks)
- Blacksmith (forge items)
- Steam Engine
- Telegraph

PRESENT ERA:
- Traffic Control
- Stock Market
- Power Grid

FUTURE ERA:
- Time Rift Stabilization
- AI Defense
- Fusion Reactor
```

### Mini-Game Lifecycle
```
1. START:
   - User clicks game card in Era screen
   - setSelectedMiniGame(gameId)
   - setIsMiniGameOpen(true)
   - Modal overlay renders with game component

2. GAMEPLAY:
   - Game component handles internal logic
   - User interacts, earns score
   - Time limit (usually 60 seconds)

3. COMPLETION:
   - Game calls onComplete(timeline, gameId, score, rewards)
   - Triggers handleMiniGameComplete()
   - Updates miniGameScores, completedMiniGames
   - Adds to totalMiniGamesPlayed
   - Awards rewards (credits, energy, stability)
   - Checks for mission completion
   - Saves everything to backend

4. REWARDS STRUCTURE:
   {
     credits: score * 10,
     energy: Math.floor(score / 100),
     stability: score > 500 ? 5 : 0,
     resources: { artifacts: 10, technology: 5, ... }
   }
```

---

## ⚙️ 6. TIME MACHINE UPGRADES

### Upgrade System
```
UPGRADE CATEGORIES:
- Core (flux capacitor, temporal processor)
- Energy (quantum battery, fusion core)
- Navigation (timeline scanner, paradox detector)
- Defense (temporal shields, chrono armor)
- Travel (warp engines, dimensional rift)
- God-Tier (quantum singularity, infinity core)

PURCHASE FLOW:
1. User selects upgrade node
2. System checks:
   - Are requirements met? (prerequisite upgrades purchased)
   - Does user have enough credits?
3. If yes → "⚡ INSTALL" button enabled
4. Click "INSTALL":
   - Deduct cost from credits
   - Add upgradeId to purchasedUpgrades array
   - Save to backend: gameState.purchasedUpgrades
   - Update machine stats:
     * Stability +5%
     * Energy capacity +100
     * Accuracy +3%
     * Cooldown reduction -2s
     * Paradox resistance +4%

PERSISTENCE:
- Upgrades stored in game_sessions.game_state.purchasedUpgrades
- Loaded on app startup via syncGameState()
- Survives page refresh and logout/login
```

---

## 🌍 7. ERA SCREENS (PAST/PRESENT/FUTURE)

### Era Navigation
```
Dashboard → Click Era Card (Past/Present/Future) → Era Screen

Each Era has:
1. BUILD ACTIONS TAB:
   - Actions to perform (cost credits, give rewards)
   - Examples: "Stabilize Monument", "Build Infrastructure"
   - Uses executeBuildAction() to process

2. MINI-GAMES TAB:
   - Shows available mini-games for that era
   - Click to play → Opens game modal
   - Completion updates scores and missions

3. MISSIONS PANEL:
   - Shows 2-3 missions for that era
   - Click "ACCEPT MISSION" → Auto-starts specific game
   - Mission completion tracked globally
```

---

## 🔄 8. COMPLETE USER JOURNEY EXAMPLE

### Scenario: New User First Session
```
1. REGISTRATION:
   → Enter username, email, password
   → Backend creates user record
   → Frontend receives token
   → Auto-creates game session with 5000 credits

2. DASHBOARD:
   → Sees 5000₵, 100 energy, 75% stability
   → Clicks "📋 MISSIONS"

3. MISSIONS PAGE:
   → Selects "Timeline Restoration" (reward: 1000₵)
   → Clicks "ACCEPT MISSION"
   → Navigates to /past with autoStartGameId: 'clockmaker'

4. PLAYING MINI-GAME:
   → Clockmaker game opens automatically
   → User aligns 5 clocks, earns 750 points
   → Game ends after 60 seconds

5. REWARDS & MISSION COMPLETION:
   → Credits: 5000 + (750 × 10) = 12,500₵
   → Energy: 100 + Math.floor(750/100) = 107
   → Mission 1 marked completed
   → All saved to backend

6. TIME MACHINE:
   → User clicks Time Machine in nav
   → Sees 12,500₵
   → Buys "Flux Capacitor Core" (500₵)
   → Credits: 12,500 - 500 = 12,000₵
   → Upgrade saved to backend

7. PAGE REFRESH:
   → Browser reloads
   → initializeAuth() runs
   → loadGameSession() fetches data
   → syncGameState() restores:
     * Credits: 12,000₵
     * Mission 1: Completed ✓
     * Upgrade: Flux Capacitor installed
   → User continues exactly where they left off
```

---

## 🛠️ 9. KEY FUNCTIONS REFERENCE

### Frontend (gameStore.js)
```javascript
// Authentication
initializeAuth()        // Load token, verify, load session
login(credentials)      // Authenticate user
register(userData)      // Create new user
logout()               // Clear session

// Game Session
loadGameSession()      // Fetch session from backend
updateGameSession(updates) // Save changes to backend
syncGameState(sessionData) // Sync backend → frontend
endGameSession()       // Close active session

// Mini-Games
submitMiniGameScore(timeline, gameId, score, data) // Submit results
completeMiniGame(timeline, gameId, score, rewards) // Local completion
loadMiniGameLeaderboard(timeline, gameId)          // Fetch rankings

// Economy
addCredits(amount)                      // Manual credit adjustment
executeBuildAction(action)              // Process build action
purchaseUpgrade(upgradeId, cost)        // Buy Time Machine upgrade

// Missions
completeMission(missionId)    // Mark mission complete
clearActiveMission()          // Reset active mission state
```

### Backend (routes/game.js)
```javascript
GET    /api/game/session          // Get active session
POST   /api/game/session          // Create new session
PUT    /api/game/session          // Update session
POST   /api/game/session/end      // End session
GET    /api/game/stats            // Get user statistics
POST   /api/game/save-progress    // Manual save
```

### Backend (routes/miniGame.js)
```javascript
POST   /api/mini-games/submit-score         // Submit score
GET    /api/mini-games/high-scores/:timeline/:gameId
GET    /api/mini-games/user-scores/:timeline/:gameId
GET    /api/mini-games/available            // List games
GET    /api/mini-games/user-stats           // User statistics
POST   /api/mini-games/validate-score       // Pre-submit validation
```

---

## 🔧 10. DEBUGGING & MAINTENANCE

### Common Issues & Solutions

**Credits showing NaN:**
- Check purchaseUpgrade() receives cost parameter
- Verify credits field in database is INTEGER, not NULL

**Credits not persisting:**
- Ensure updateGameSession() is called after changes
- Check token exists (tokenUtils.getToken())
- Verify backend is running and accessible

**Missions not completing:**
- Check missionMapping in completeMiniGame()
- Verify completedMissions array in gameState
- Ensure updateGameSession includes gameState.completedMissions

**Upgrades not saving:**
- Confirm purchaseUpgrade() includes gameState.purchasedUpgrades
- Check syncGameState() has getPurchasedUpgrades() helper

### Monitoring
```javascript
// Enable detailed logging (already in code):
console.log('Syncing game state from server:', sessionData)
console.log('Sending updates to server:', updates)
console.log('Server update response:', response)
console.log('Buying upgrade, saving to backend...', {...})
```

---

## 📊 11. DATA FLOW DIAGRAM

```
USER ACTION (e.g., Buy Upgrade)
    ↓
FRONTEND STATE UPDATE (Zustand)
    ↓
CHECK TOKEN (tokenUtils.getToken())
    ↓
API CALL (gameAPI.updateSession)
    ↓
BACKEND VALIDATION
    ↓
DATABASE UPDATE (SQLite)
    ↓
BACKEND RESPONSE (Updated Session)
    ↓
SYNC STATE (syncGameState)
    ↓
UI UPDATE (React Re-render)
```

---

## ✅ TESTING CHECKLIST

- [ ] Register new user → 5000 credits shown
- [ ] Play mini-game → Credits increase
- [ ] Buy upgrade → Credits decrease, upgrade saved
- [ ] Complete mission → Mission marked complete
- [ ] Refresh page → All state restored correctly
- [ ] Navigate between pages → Credits consistent
- [ ] Logout and login → Progress persists
- [ ] Token expires → Graceful handling

---

## 🎯 GAME PROGRESSION PATH

```
START (5000₵)
    ↓
Complete 3-5 Mini-Games (15,000₵+)
    ↓
Buy First Time Machine Upgrades (10,000₵)
    ↓
Complete All Missions (20,000₵+)
    ↓
Unlock God-Tier Upgrades (50,000₵+)
    ↓
Achieve Victory Conditions:
  - 100,000+ credits
  - 60%+ stability
  - 3+ upgrades purchased
    ↓
ENDING SCREEN
```

---

## 📝 IMPORTANT NOTES

1. **Optimistic UI**: State updates immediately, backend saves asynchronously
2. **Token Safety**: All backend calls check for token first
3. **Error Handling**: Failed saves logged to console, UI stays functional
4. **Offline Mode**: Game playable without backend (no persistence)
5. **Data Synchronization**: Always trust backend data over local state
6. **Performance**: Zustand provides fast, reactive state updates
7. **Security**: JWT tokens expire, passwords hashed with bcrypt

---

**Last Updated**: 2025-12-23
**Version**: 1.0
**Status**: Production Ready ✅
