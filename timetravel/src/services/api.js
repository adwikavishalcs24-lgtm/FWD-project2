// API Service Layer for Time Travel Tycoon


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Network error'
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Refresh token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return handleResponse(response);
  },

  // Verify token
  verifyToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return handleResponse(response);
  }
};

// Game API
export const gameAPI = {
  // Get current game session
  getCurrentSession: async () => {
    const response = await fetch(`${API_BASE_URL}/game/session`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create new game session
  createSession: async (sessionData) => {
    const response = await fetch(`${API_BASE_URL}/game/session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData)
    });
    return handleResponse(response);
  },

  // Update game session
  updateSession: async (updates) => {
    const response = await fetch(`${API_BASE_URL}/game/session`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  // End game session
  endSession: async () => {
    const response = await fetch(`${API_BASE_URL}/game/session/end`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get game statistics
  getGameStats: async () => {
    const response = await fetch(`${API_BASE_URL}/game/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Save game progress
  saveProgress: async (progressData) => {
    const response = await fetch(`${API_BASE_URL}/game/save-progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData)
    });
    return handleResponse(response);
  }
};

// Mini-Game API
export const miniGameAPI = {
  // Submit mini-game score
  submitScore: async (scoreData) => {
    const response = await fetch(`${API_BASE_URL}/mini-games/submit-score`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scoreData)
    });
    return handleResponse(response);
  },

  // Get high scores for specific game
  getHighScores: async (timeline, gameId, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/mini-games/high-scores/${timeline}/${gameId}?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user's scores for specific game
  getUserScores: async (timeline, gameId) => {
    const response = await fetch(`${API_BASE_URL}/mini-games/user-scores/${timeline}/${gameId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get available mini-games
  getAvailableGames: async () => {
    const response = await fetch(`${API_BASE_URL}/mini-games/available`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user mini-game statistics
  getUserStats: async () => {
    const response = await fetch(`${API_BASE_URL}/mini-games/user-stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Validate score before submission
  validateScore: async (scoreData) => {
    const response = await fetch(`${API_BASE_URL}/mini-games/validate-score`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scoreData)
    });
    return handleResponse(response);
  }
};

// Leaderboard API
export const leaderboardAPI = {
  // Get top scores leaderboard
  getScoreLeaderboard: async (limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/score?limit=${limit}`);
    return handleResponse(response);
  },

  // Get mini-games played leaderboard
  getMiniGamesLeaderboard: async (limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/mini-games?limit=${limit}`);
    return handleResponse(response);
  },

  // Get time played leaderboard
  getTimePlayedLeaderboard: async (limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/time-played?limit=${limit}`);
    return handleResponse(response);
  },

  // Get specific mini-game leaderboard
  getMiniGameLeaderboard: async (timeline, gameId, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/mini-game/${timeline}/${gameId}?limit=${limit}`);
    return handleResponse(response);
  },

  // Get user rankings
  getUserRankings: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/user/${userId}`);
    return handleResponse(response);
  },

  // Get global statistics
  getGlobalStats: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/global-stats`);
    return handleResponse(response);
  },

  // Get recent games
  getRecentGames: async (limit = 20) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/recent-games?limit=${limit}`);
    return handleResponse(response);
  }
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  // Get user achievements
  getAchievements: async () => {
    const response = await fetch(`${API_BASE_URL}/user/achievements`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user statistics
  getUserStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/user/statistics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await fetch(`${API_BASE_URL}/user/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Health check API
export const healthAPI = {
  checkServer: async () => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return handleResponse(response);
  }
};

// Token management utilities
export const tokenUtils = {
  // Save token to localStorage
  saveToken: (token, userData) => {
    localStorage.setItem('authToken', token);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Get user data from localStorage
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Clear token from localStorage
  clearToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Check if token is valid
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Simple JWT decode to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

export default {
  auth: authAPI,
  game: gameAPI,
  miniGame: miniGameAPI,
  leaderboard: leaderboardAPI,
  user: userAPI,
  health: healthAPI,
  tokenUtils
};
