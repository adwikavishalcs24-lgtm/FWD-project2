import create from 'zustand';

export const useGameStore = create((set) => ({
  // Player data
  username: 'Agent Timeline',
  credits: 5000,
  energy: 100,
  maxEnergy: 100,
  stability: 75,
  maxStability: 100,

  // Current location
  currentEra: 'dashboard', // dashboard, past, present, future
  
  // Game state
  isGameOver: false,
  hasEnded: false,
  eventActive: false,
  currentEvent: null,

  // Resources
  resources: {
    past: { influence: 0, artifacts: 0 },
    present: { influence: 0, technology: 0 },
    future: { influence: 0, innovations: 0 },
  },

  // Upgrades
  purchasedUpgrades: [],

  // Missions
  completedMissions: [],
  activeMission: null,

  // Leaderboard scores
  score: 0,
  timePlayedSeconds: 0,

  // Actions
  setUsername: (username) => set({ username }),
  addCredits: (amount) => set((state) => ({ 
    credits: Math.max(0, state.credits + amount) 
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
    isGameOver: false,
    hasEnded: false,
    eventActive: false,
    currentEvent: null,
    resources: {
      past: { influence: 0, artifacts: 0 },
      present: { influence: 0, technology: 0 },
      future: { influence: 0, innovations: 0 },
    },
    purchasedUpgrades: [],
    completedMissions: [],
    score: 0,
    timePlayedSeconds: 0,
    currentEra: 'dashboard',
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
