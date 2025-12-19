
import create from 'zustand';
import { authAPI, gameAPI, miniGameAPI, leaderboardAPI, userAPI, tokenUtils } from '../services/api';

export const useGameStore = create((set, get) => ({
  // Authentication state
  isAuthenticated: false,
  currentUser: null,
  authLoading: false,
  authError: null,

  // Player data
  username: 'Agent Timeline',
  credits: 5000,
  energy: 100,
  maxEnergy: 100,
  stability: 75,
  maxStability: 100,
  coinsPerSecond: 0,

  // Current location
  currentEra: 'dashboard', // dashboard, past, present, future
  
  // Game state
  isGameOver: false,
  hasEnded: false,
  eventActive: false,
  currentEvent: null,
  gameSession: null,
  gameLoading: false,

  // Resources
  resources: {
    past: { influence: 0, artifacts: 0, coal: 0, metal: 0, mechanicalOutput: 0 },
    present: { influence: 0, technology: 0, money: 0, energy: 0, efficiency: 0 },
    future: { influence: 0, innovations: 0, hyperEnergy: 0, fusionOutput: 0, aiProductivity: 0 },
  },

  // Mini-game system
  activeMiniGame: null,
  miniGameScores: {
    past: { blacksmith: 0, steam: 0, clockmaker: 0, telegraph: 0 },
    present: { traffic: 0, stock: 0, grid: 0 },
    future: { rift: 0, defense: 0, reactor: 0 }
  },
  completedMiniGames: {
    past: [],
    present: [],
    future: []
  },
  miniGameAttempts: 0,

  // Random Events System
  randomEvents: [],
  lastEventTime: 0,
  eventQueue: [],
  eventCooldown: 30000, // 30 seconds between events

  // Timeline stability per era
  timelineStability: {
    past: 75,
    present: 75,
    future: 75
  },

  // Upgrades
  purchasedUpgrades: [],

  // Missions
  completedMissions: [],
  activeMission: null,

  // Leaderboard scores
  score: 0,
  timePlayedSeconds: 0,

  // Game statistics
  totalCreditsEarned: 0,
  totalMiniGamesPlayed: 0,
  paradoxLevel: 0,

  // Leaderboard data
  leaderboardData: {
    score: [],
    miniGames: [],
    timePlayed: [],
    globalStats: null
  },

  // Socket.IO connection state
  socketConnected: false,
  onlineUsers: [],

  // ========== AUTHENTICATION ACTIONS ==========
  
  // Initialize authentication from stored token
  initializeAuth: async () => {
    try {
      const token = tokenUtils.getToken();
      const userData = tokenUtils.getUserData();
      
      if (token && tokenUtils.isTokenValid() && userData) {
        set({ 
          isAuthenticated: true, 
          currentUser: userData,
          username: userData.username || 'Agent Timeline'
        });
        
        // Verify token with server
        try {
          const user = await authAPI.getCurrentUser();
          set({ currentUser: user, isAuthenticated: true });
          tokenUtils.saveToken(token, user);
        } catch (error) {
          console.error('Token verification failed:', error);
          tokenUtils.clearToken();
          set({ isAuthenticated: false, currentUser: null });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  },

  // Register new user
  register: async (userData) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response;
      
      tokenUtils.saveToken(token, user);
      set({ 
        isAuthenticated: true, 
        currentUser: user, 
        username: user.username,
        authLoading: false 
      });
      
      // Create initial game session
      await get().createGameSession();
      
      return response;
    } catch (error) {
      set({ 
        authLoading: false, 
        authError: error.message 
      });
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response;
      
      tokenUtils.saveToken(token, user);
      set({ 
        isAuthenticated: true, 
        currentUser: user, 
        username: user.username,
        authLoading: false 
      });
      
      // Load existing game session or create new one
      await get().loadGameSession();
      
      return response;
    } catch (error) {
      set({ 
        authLoading: false, 
        authError: error.message 
      });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      if (get().isAuthenticated) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenUtils.clearToken();
      set({
        isAuthenticated: false,
        currentUser: null,
        gameSession: null,
        username: 'Agent Timeline'
      });
      get().resetGame();
    }
  },

  // ========== GAME SESSION ACTIONS ==========
  
  // Create new game session
  createGameSession: async (sessionData = {}) => {
    set({ gameLoading: true });
    try {
      const gameData = {
        username: get().username,
        initialCredits: get().credits,
        initialEnergy: get().energy,
        initialStability: get().stability,
        ...sessionData
      };
      
      const response = await gameAPI.createSession(gameData);
      set({ 
        gameSession: response.session,
        gameLoading: false 
      });
      
      // Sync local state with server data
      get().syncGameState(response.session);
      
      return response;
    } catch (error) {
      set({ gameLoading: false });
      console.error('Create session error:', error);
      throw error;
    }
  },

  // Load existing game session
  loadGameSession: async () => {
    set({ gameLoading: true });
    try {
      const response = await gameAPI.getCurrentSession();
      if (response.session) {
        set({ 
          gameSession: response.session,
          gameLoading: false 
        });
        get().syncGameState(response.session);
      } else {
        // No existing session, create new one
        await get().createGameSession();
      }
    } catch (error) {
      set({ gameLoading: false });
      console.error('Load session error:', error);
      // If no session exists, create new one
      await get().createGameSession();
    }
  },

  // Sync local state with server game data
  syncGameState: (sessionData) => {
    if (!sessionData) return;
    
    set({
      username: sessionData.username || get().username,
      credits: sessionData.credits || get().credits,
      energy: sessionData.energy || get().energy,
      stability: sessionData.stability || get().stability,
      score: sessionData.score || get().score,
      timePlayedSeconds: sessionData.time_played_seconds || get().timePlayedSeconds,
      resources: sessionData.resources ? JSON.parse(sessionData.resources) : get().resources,
      timelineStability: sessionData.timeline_stability ? JSON.parse(sessionData.timeline_stability) : get().timelineStability
    });
  },

  // Update game session
  updateGameSession: async (updates) => {
    try {
      const response = await gameAPI.updateSession(updates);
      set({ gameSession: response.session });
      
      // Sync local state
      get().syncGameState(response.session);
      
      return response;
    } catch (error) {
      console.error('Update session error:', error);
      throw error;
    }
  },

  // End game session
  endGameSession: async () => {
    try {
      await gameAPI.endSession();
      set({ gameSession: null });
    } catch (error) {
      console.error('End session error:', error);
      throw error;
    }
  },

  // ========== MINI-GAME ACTIONS ==========
  
  // Submit mini-game score to server
  submitMiniGameScore: async (timeline, gameId, score, additionalData = {}) => {
    try {
      const scoreData = {
        timeline,
        game_id: gameId,
        score: score,
        time_spent: additionalData.timeSpent || 0,
        attempts: additionalData.attempts || 1,
        additional_data: additionalData
      };
      
      const response = await miniGameAPI.submitScore(scoreData);
      
      // Update local scores
      get().completeMiniGame(timeline, gameId, score, response.rewards || {});
      
      // Update server game session with new data
      await get().updateGameSession({
        credits: get().credits,
        score: get().score,
        total_mini_games_played: get().totalMiniGamesPlayed
      });
      
      return response;
    } catch (error) {
      console.error('Submit score error:', error);
      throw error;
    }
  },

  // Load mini-game leaderboard
  loadMiniGameLeaderboard: async (timeline, gameId) => {
    try {
      const response = await miniGameAPI.getHighScores(timeline, gameId);
      return response;
    } catch (error) {
      console.error('Load leaderboard error:', error);
      throw error;
    }
  },

  // ========== LEADERBOARD ACTIONS ==========
  
  // Load all leaderboard data
  loadLeaderboards: async () => {
    try {
      const [scoreData, miniGamesData, timePlayedData, globalStats] = await Promise.all([
        leaderboardAPI.getScoreLeaderboard(),
        leaderboardAPI.getMiniGamesLeaderboard(),
        leaderboardAPI.getTimePlayedLeaderboard(),
        leaderboardAPI.getGlobalStats()
      ]);
      
      set({
        leaderboardData: {
          score: scoreData.leaderboard || [],
          miniGames: miniGamesData.leaderboard || [],
          timePlayed: timePlayedData.leaderboard || [],
          globalStats: globalStats
        }
      });
    } catch (error) {
      console.error('Load leaderboards error:', error);
    }
  },

  // ========== USER PROFILE ACTIONS ==========
  
  // Load user profile and statistics
  loadUserProfile: async () => {
    try {
      const [profile, achievements, statistics] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getAchievements(),
        userAPI.getUserStatistics()
      ]);
      
      set({
        currentUser: {
          ...get().currentUser,
          profile,
          achievements,
          statistics
        }
      });
      
      return { profile, achievements, statistics };
    } catch (error) {
      console.error('Load profile error:', error);
      throw error;
    }
  },



  // ========== GAME ACTIONS ==========

  // Mini-game Actions
  startMiniGame: (gameId) => set({
    activeMiniGame: gameId,
    miniGameAttempts: get().miniGameAttempts + 1
  }),
  

  completeMiniGame: (timeline, gameId, score, rewards) => set((state) => {
    const newScores = { ...state.miniGameScores };
    newScores[timeline][gameId] = Math.max(newScores[timeline][gameId], score);
    
    const newCompleted = { ...state.completedMiniGames };
    if (!newCompleted[timeline].includes(gameId)) {
      newCompleted[timeline].push(gameId);
    }
    
    const newCredits = state.credits + (rewards?.credits || 0);
    const newEnergy = Math.min(state.maxEnergy, state.energy + (rewards?.energy || 0));
    const newStability = Math.max(0, Math.min(100, state.stability + (rewards?.stability || 0)));
    const newScore = state.score + score;
    
    // Update server with new values
    get().updateGameSession({
      credits: newCredits,
      energy: newEnergy,
      stability: newStability,
      score: newScore,
      total_mini_games_played: state.totalMiniGamesPlayed + 1
    }).catch(console.error);
    
    return {
      activeMiniGame: null,
      miniGameScores: newScores,
      completedMiniGames: newCompleted,
      totalMiniGamesPlayed: state.totalMiniGamesPlayed + 1,
      credits: newCredits,
      energy: newEnergy,
      stability: newStability,
      coinsPerSecond: state.coinsPerSecond + (rewards?.coinsPerSecond || 0),
      totalCreditsEarned: state.totalCreditsEarned + (rewards?.credits || 0),
      score: newScore,
      resources: {
        ...state.resources,
        [timeline]: {
          ...state.resources[timeline],
          ...rewards?.resources
        }
      }
    };
  }),
  
  // Random Events Actions
  triggerRandomEvent: (event) => set((state) => ({
    eventActive: true,
    currentEvent: event,
    lastEventTime: Date.now()
  })),
  
  resolveEvent: (eventId, choice) => set((state) => {
    const event = state.randomEvents.find(e => e.id === eventId);
    if (!event) return state;
    
    const resolution = event.resolutions[choice];
    const effects = resolution.effects || {};
    
    return {
      eventActive: false,
      currentEvent: null,
      credits: Math.max(0, state.credits + (effects.credits || 0)),
      energy: Math.max(0, Math.min(state.maxEnergy, state.energy + (effects.energy || 0))),
      stability: Math.max(0, Math.min(100, state.stability + (effects.stability || 0))),
      paradoxLevel: Math.max(0, state.paradoxLevel + (effects.paradox || 0)),
      timelineStability: {
        ...state.timelineStability,
        [event.timeline]: Math.max(0, Math.min(100, 
          state.timelineStability[event.timeline] + (effects.timelineStability || 0)))
      }
    };
  }),
  
  // Timeline-specific stability
  updateTimelineStability: (timeline, amount) => set((state) => {
    const newStability = Math.max(0, Math.min(100, state.timelineStability[timeline] + amount));
    
    // Check for timeline collapse
    if (newStability <= 0) {
      return {
        timelineStability: {
          ...state.timelineStability,
          [timeline]: 0
        },
        isGameOver: true,
        stability: 0
      };
    }
    
    return {
      timelineStability: {
        ...state.timelineStability,
        [timeline]: newStability
      }
    };
  }),
  
  // Victory/Lose Conditions Check
  checkWinCondition: () => set((state) => {
    const hasMinUpgrades = state.purchasedUpgrades.length >= 3; // At least 1 per timeline
    const hasEnoughCredits = state.credits >= 100000;
    const hasGoodStability = state.stability >= 60;
    
    if (hasEnoughCredits && hasGoodStability && hasMinUpgrades) {
      return { hasEnded: true };
    }
    return {};
  }),
  
  // Actions
  setUsername: (username) => set({ username }),
  addCredits: (amount) => set((state) => ({ 
    credits: Math.max(0, state.credits + amount),
    totalCreditsEarned: state.totalCreditsEarned + Math.max(0, amount)
  })),
  useEnergy: (amount) => set((state) => ({
    energy: Math.max(0, state.energy - amount)
  })),
  restoreEnergy: (amount) => set((state) => ({
    energy: Math.min(state.maxEnergy, state.energy + amount)
  })),
  setStability: (amount) => set({
    stability: Math.max(0, Math.min(100, amount))
  }),
  decreaseStability: (amount) => set((state) => ({
    stability: Math.max(0, state.stability - amount)
  })),
  setCurrentEra: (era) => set({ currentEra: era }),
  triggerGameOver: () => set({ isGameOver: true }),
  triggerEnding: () => set({ hasEnded: true }),
  resetGame: () => set({
    credits: 5000,
    energy: 100,
    stability: 75,
    maxEnergy: 100,
    maxStability: 100,
    coinsPerSecond: 0,
    isGameOver: false,
    hasEnded: false,
    eventActive: false,
    currentEvent: null,

    resources: {
      past: { influence: 0, artifacts: 0, coal: 0, metal: 0, mechanicalOutput: 0 },
      present: { influence: 0, technology: 0, money: 0, energy: 0, efficiency: 0 },
      future: { influence: 0, innovations: 0, hyperEnergy: 0, fusionOutput: 0, aiProductivity: 0 },
    },
    miniGameScores: {
      past: { blacksmith: 0, steam: 0, clockmaker: 0, telegraph: 0 },
      present: { traffic: 0, stock: 0, grid: 0 },
      future: { rift: 0, defense: 0, reactor: 0 }
    },
    completedMiniGames: {
      past: [],
      present: [],
      future: []
    },
    miniGameAttempts: 0,
    randomEvents: [],
    lastEventTime: 0,
    eventQueue: [],
    timelineStability: {
      past: 75,
      present: 75,
      future: 75
    },
    purchasedUpgrades: [],
    completedMissions: [],
    score: 0,
    timePlayedSeconds: 0,
    totalCreditsEarned: 0,
    totalMiniGamesPlayed: 0,
    paradoxLevel: 0,
    currentEra: 'dashboard',
    activeMiniGame: null
  }),
  showEvent: (event) => set({
    eventActive: true,
    currentEvent: event,
  }),
  closeEvent: () => set({
    eventActive: false,
    currentEvent: null,
  }),
  completeUpgrade: (upgradeId) => set((state) => ({
    purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
  })),
  purchaseUpgrade: (upgradeId) => set((state) => ({
    purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
  })),
  completeMission: (missionId) => set((state) => ({
    completedMissions: [...state.completedMissions, missionId],
  })),
  addScore: (amount) => set((state) => ({
    score: state.score + amount,
  })),
  addTimePlayedSeconds: (seconds) => set((state) => ({
    timePlayedSeconds: state.timePlayedSeconds + seconds,
  })),
}));
