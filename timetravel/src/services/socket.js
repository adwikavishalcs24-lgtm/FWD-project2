import io from 'socket.io-client';
import { tokenUtils } from './api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize Socket.IO connection
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }


const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
    
    this.socket = io(socketUrl, {
      auth: {
        token: token || tokenUtils.getToken()
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventListeners();
  }

  // Setup Socket.IO event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    // Game events
    this.socket.on('game-state-update', (data) => {
      console.log('Game state update received:', data);
      // Handle real-time game state updates
      if (window.gameStore && window.gameStore.syncGameState) {
        window.gameStore.syncGameState(data);
      }
    });

    this.socket.on('leaderboard-update', (data) => {
      console.log('Leaderboard update received:', data);
      // Handle real-time leaderboard updates
      if (window.gameStore && window.gameStore.loadLeaderboards) {
        window.gameStore.loadLeaderboards();
      }
    });

    this.socket.on('mini-game-update', (data) => {
      console.log('Mini-game update received:', data);
      // Handle mini-game updates
    });

    this.socket.on('user-online', (data) => {
      console.log('User online:', data);
      // Handle user online status updates
    });

    this.socket.on('user-offline', (data) => {
      console.log('User offline:', data);
      // Handle user offline status updates
    });

    this.socket.on('chat-message', (data) => {
      console.log('Chat message received:', data);
      // Handle chat messages
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join game room
  joinGameRoom(gameSessionId) {
    if (this.socket?.connected) {
      this.socket.emit('join-game-room', { gameSessionId });
      console.log('Joined game room:', gameSessionId);
    }
  }

  // Leave game room
  leaveGameRoom(gameSessionId) {
    if (this.socket?.connected) {
      this.socket.emit('leave-game-room', { gameSessionId });
      console.log('Left game room:', gameSessionId);
    }
  }

  // Submit mini-game score
  submitMiniGameScore(scoreData) {
    if (this.socket?.connected) {
      this.socket.emit('submit-mini-game-score', scoreData);
      console.log('Mini-game score submitted:', scoreData);
    }
  }

  // Send chat message
  sendChatMessage(message) {
    if (this.socket?.connected) {
      this.socket.emit('chat-message', { message });
    }
  }

  // Update game state
  updateGameState(gameState) {
    if (this.socket?.connected) {
      this.socket.emit('game-state-update', gameState);
    }
  }

  // Request leaderboard data
  requestLeaderboard(type = 'score') {
    if (this.socket?.connected) {
      this.socket.emit('request-leaderboard', { type });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket;
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  // Send custom event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Listen for custom event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export both the class and the singleton
export default socketService;
export { SocketService };

// Hook for React components
export const useSocket = () => {
  return {
    connect: (token) => socketService.connect(token),
    disconnect: () => socketService.disconnect(),
    joinGameRoom: (gameSessionId) => socketService.joinGameRoom(gameSessionId),
    leaveGameRoom: (gameSessionId) => socketService.leaveGameRoom(gameSessionId),
    submitMiniGameScore: (scoreData) => socketService.submitMiniGameScore(scoreData),
    sendChatMessage: (message) => socketService.sendChatMessage(message),
    updateGameState: (gameState) => socketService.updateGameState(gameState),
    requestLeaderboard: (type) => socketService.requestLeaderboard(type),
    emit: (event, data) => socketService.emit(event, data),
    on: (event, callback) => socketService.on(event, callback),
    off: (event, callback) => socketService.off(event, callback),
    getConnectionStatus: () => socketService.getConnectionStatus(),
    isConnected: () => socketService.isSocketConnected(),
    getSocket: () => socketService.getSocket()
  };
};
