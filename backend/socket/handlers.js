const jwt = require('jsonwebtoken');
const { userDB, gameSessionDB } = require('../config/database');

// Store active connections
const activeConnections = new Map();
const userSockets = new Map();

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await userDB.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    // Attach user info to socket
    socket.user = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

// Setup Socket.IO event handlers
const setupSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const username = socket.user.username;

    console.log(`User connected: ${username} (${userId})`);

    // Store active connection
    activeConnections.set(socket.id, {
      userId,
      username,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Map user to socket for easy lookup
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Send welcome message
    socket.emit('connected', {
      message: 'Welcome to Time Travel Tycoon!',
      user: {
        id: userId,
        username: username,
        displayName: socket.user.display_name
      },
      timestamp: new Date().toISOString()
    });

    // Broadcast user online status to other connected users
    socket.broadcast.emit('user_online', {
      userId,
      username,
      displayName: socket.user.display_name,
      timestamp: new Date().toISOString()
    });

    // Handle game session updates
    socket.on('game_session_update', async (data) => {
      try {
        socket.user.lastActivity = new Date();
        
        const session = await gameSessionDB.findActiveByUserId(userId);
        if (!session) {
          socket.emit('error', {
            message: 'No active game session found',
            code: 'NO_SESSION'
          });
          return;
        }

        // Update session data if provided
        if (data.updates) {
          const updatedSession = await gameSessionDB.update(session.id, data.updates);
          
          // Broadcast update to other users (for multiplayer features)
          socket.broadcast.emit('session_updated', {
            userId,
            username,
            updates: data.updates,
            timestamp: new Date().toISOString()
          });
        }

        // Send current session state
        socket.emit('session_state', {
          session: {
            id: session.id,
            credits: session.credits,
            energy: session.energy,
            stability: session.stability,
            score: session.score,
            currentEra: session.current_era
          }
        });

      } catch (error) {
        console.error('Game session update error:', error);
        socket.emit('error', {
          message: 'Failed to update game session',
          code: 'SESSION_UPDATE_ERROR'
        });
      }
    });

    // Handle mini-game score sharing
    socket.on('mini_game_score', async (data) => {
      try {
        socket.user.lastActivity = new Date();
        
        const { timeline, gameId, score, isNewPersonalBest } = data;

        // Broadcast score to other users (for competitive features)
        socket.broadcast.emit('score_shared', {
          userId,
          username,
          displayName: socket.user.display_name,
          timeline,
          gameId,
          score,
          isNewPersonalBest,
          timestamp: new Date().toISOString()
        });

        console.log(`Score shared: ${username} - ${timeline}/${gameId} - ${score}`);

      } catch (error) {
        console.error('Mini-game score sharing error:', error);
        socket.emit('error', {
          message: 'Failed to share mini-game score',
          code: 'SCORE_SHARE_ERROR'
        });
      }
    });

    // Handle real-time game events
    socket.on('game_event', (data) => {
      socket.user.lastActivity = new Date();
      
      const { eventType, eventData } = data;

      // Broadcast game events to other users
      socket.broadcast.emit('game_event_received', {
        userId,
        username,
        eventType,
        eventData,
        timestamp: new Date().toISOString()
      });

      console.log(`Game event: ${username} - ${eventType}`);
    });

    // Handle chat messages (for future multiplayer features)
    socket.on('chat_message', (data) => {
      socket.user.lastActivity = new Date();
      
      const { message, room = 'global' } = data;

      // Sanitize message
      const sanitizedMessage = message
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim()
        .substring(0, 500); // Limit length

      if (sanitizedMessage.length === 0) {
        socket.emit('error', {
          message: 'Message cannot be empty',
          code: 'INVALID_MESSAGE'
        });
        return;
      }

      const chatMessage = {
        userId,
        username,
        displayName: socket.user.display_name,
        message: sanitizedMessage,
        room,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all users in the room
      io.to(room).emit('chat_message_received', chatMessage);

      console.log(`Chat message: ${username} in ${room}: ${sanitizedMessage}`);
    });

    // Handle room joining (for future multiplayer features)
    socket.on('join_room', (data) => {
      const { room } = data;
      
      socket.join(room);
      socket.user.lastActivity = new Date();

      socket.emit('room_joined', {
        room,
        timestamp: new Date().toISOString()
      });

      // Notify others in the room
      socket.to(room).emit('user_joined_room', {
        userId,
        username,
        displayName: socket.user.display_name,
        room,
        timestamp: new Date().toISOString()
      });

      console.log(`${username} joined room: ${room}`);
    });

    // Handle room leaving
    socket.on('leave_room', (data) => {
      const { room } = data;
      
      socket.leave(room);
      socket.user.lastActivity = new Date();

      socket.emit('room_left', {
        room,
        timestamp: new Date().toISOString()
      });

      // Notify others in the room
      socket.to(room).emit('user_left_room', {
        userId,
        username,
        room,
        timestamp: new Date().toISOString()
      });

      console.log(`${username} left room: ${room}`);
    });

    // Handle heartbeat/ping
    socket.on('ping', () => {
      socket.user.lastActivity = new Date();
      socket.emit('pong', {
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${username} (${userId}) - Reason: ${reason}`);
      
      // Clean up user mappings
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        
        // If no more sockets for this user, remove from userSockets
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          
          // Broadcast user offline status
          socket.broadcast.emit('user_offline', {
            userId,
            username,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Remove from active connections
      activeConnections.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${username}:`, error);
    });
  });

  // Utility functions for broadcasting to specific users
  const sendToUser = (userId, event, data) => {
    const userSocketIds = userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      });
    }
  };

  const broadcastToAll = (event, data) => {
    io.emit(event, data);
  };

  const getActiveUsers = () => {
    const users = [];
    userSockets.forEach((socketIds, userId) => {
      if (socketIds.size > 0) {
        users.push({ userId, socketCount: socketIds.size });
      }
    });
    return users;
  };

  // Clean up inactive connections periodically
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    activeConnections.forEach((connection, socketId) => {
      if (now - connection.lastActivity > inactiveThreshold) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          console.log(`Cleaning up inactive connection: ${connection.username}`);
          socket.disconnect(true);
        }
      }
    });
  }, 15 * 60 * 1000); // Run every 15 minutes

  // Expose utility functions
  io.sendToUser = sendToUser;
  io.broadcastToAll = broadcastToAll;
  io.getActiveUsers = getActiveUsers;

  console.log('Socket.IO handlers setup complete');
};

// Helper function to get connection statistics
const getConnectionStats = () => {
  return {
    totalConnections: activeConnections.size,
    uniqueUsers: userSockets.size,
    activeConnections: Array.from(activeConnections.values()).map(conn => ({
      userId: conn.userId,
      username: conn.username,
      connectedAt: conn.connectedAt,
      lastActivity: conn.lastActivity
    }))
  };
};

module.exports = {
  setupSocketHandlers,
  getConnectionStats,
  authenticateSocket
};
