const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance and connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'time_travel_tycoon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeoutMillis: 60000,
  connectTimeout: 60000,
  charset: 'utf8mb4'
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database configuration in .env file');
    console.error('Make sure MySQL is running and credentials are correct');
    return false;
  }
};

// Helper function to execute queries with error handling
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', {
      sql,
      params,
      error: error.message
    });
    throw error;
  }
};

// Helper function to execute transactions
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    connection.release();
    return result;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};

// Helper function to build dynamic WHERE clauses
const buildWhereClause = (conditions, params = []) => {
  const clauses = [];
  
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle complex conditions like { gt: 0, lt: 100 }
        Object.entries(value).forEach(([operator, val]) => {
          switch (operator) {
            case 'gt':
              clauses.push(`${key} > ?`);
              params.push(val);
              break;
            case 'gte':
              clauses.push(`${key} >= ?`);
              params.push(val);
              break;
            case 'lt':
              clauses.push(`${key} < ?`);
              params.push(val);
              break;
            case 'lte':
              clauses.push(`${key} <= ?`);
              params.push(val);
              break;
            case 'ne':
              clauses.push(`${key} != ?`);
              params.push(val);
              break;
            case 'in':
              if (Array.isArray(val) && val.length > 0) {
                const placeholders = val.map(() => '?').join(',');
                clauses.push(`${key} IN (${placeholders})`);
                params.push(...val);
              }
              break;
            case 'like':
              clauses.push(`${key} LIKE ?`);
              params.push(val);
              break;
            default:
              clauses.push(`${key} = ?`);
              params.push(val);
          }
        });
      } else if (Array.isArray(value)) {
        // Handle array values
        if (value.length > 0) {
          const placeholders = value.map(() => '?').join(',');
          clauses.push(`${key} IN (${placeholders})`);
          params.push(...value);
        }
      } else {
        // Simple equality
        clauses.push(`${key} = ?`);
        params.push(value);
      }
    }
  });
  
  return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
};

// Helper function for pagination
const buildPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: Math.min(parseInt(limit) || 10, 100), // Max 100 per page
    offset: Math.max(parseInt(offset) || 0, 0)
  };
};

// Helper function to count total records
const countQuery = async (table, conditions = {}) => {
  const params = [];
  const whereClause = buildWhereClause(conditions, params);
  const sql = `SELECT COUNT(*) as total FROM ${table} ${whereClause}`;
  const result = await query(sql, params);
  return result[0].total;
};

// User-related database functions
const userDB = {
  // Find user by ID
  findById: async (id) => {
    const sql = `
      SELECT id, username, email, display_name, avatar_url, created_at, last_login, is_active, is_verified
      FROM users WHERE id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Find user by username or email
  findByUsernameOrEmail: async (identifier) => {
    const sql = `
      SELECT id, username, email, password_hash, display_name, avatar_url, created_at, last_login, is_active, is_verified
      FROM users WHERE username = ? OR email = ?
    `;
    const results = await query(sql, [identifier, identifier]);
    return results[0] || null;
  },

  // Create new user
  create: async (userData) => {
    const { username, email, password_hash, display_name } = userData;
    const sql = `
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [username, email, password_hash, display_name]);
    return userDB.findById(result.insertId);
  },

  // Update user last login
  updateLastLogin: async (id) => {
    const sql = `UPDATE users SET last_login = NOW() WHERE id = ?`;
    await query(sql, [id]);
  },

  // Update user profile
  updateProfile: async (id, updates) => {
    const allowedFields = ['display_name', 'avatar_url', 'email'];
    const fields = [];
    const values = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return userDB.findById(id);
  }
};

// Game session-related database functions
const gameSessionDB = {
  // Find active game session for user
  findActiveByUserId: async (userId, sessionName = 'Main Game') => {
    const sql = `
      SELECT * FROM game_sessions 
      WHERE user_id = ? AND session_name = ? AND is_active = TRUE
    `;
    const results = await query(sql, [userId, sessionName]);
    return results[0] || null;
  },

  // Create new game session
  create: async (userId, gameState) => {
    const sql = `
      INSERT INTO game_sessions (user_id, session_name, game_state)
      VALUES (?, 'Main Game', ?)
    `;
    const result = await query(sql, [userId, JSON.stringify(gameState)]);
    return gameSessionDB.findById(result.insertId);
  },

  // Update game session
  update: async (sessionId, updates) => {
    const fields = [];
    const values = [];
    
    // Define allowed fields for updates
    const allowedFields = [
      'credits', 'energy', 'max_energy', 'stability', 'max_stability',
      'coins_per_second', 'current_era', 'total_credits_earned',
      'time_played_seconds', 'total_mini_games_played', 'paradox_level', 'score'
    ];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'game_state') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(sessionId);
    const sql = `UPDATE game_sessions SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return gameSessionDB.findById(sessionId);
  },

  // Find by ID
  findById: async (id) => {
    const sql = `SELECT * FROM game_sessions WHERE id = ? AND is_active = TRUE`;
    const results = await query(sql, [id]);
    return results[0] || null;
  }
};

// Mini-game scores database functions
const miniGameDB = {
  // Save mini-game score
  saveScore: async (userId, sessionId, timeline, gameId, score, rewards, duration) => {
    const sql = `
      INSERT INTO mini_game_scores (user_id, session_id, timeline, game_id, score, rewards, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      userId, sessionId, timeline, gameId, score, 
      JSON.stringify(rewards), duration
    ]);
    return miniGameDB.findById(result.insertId);
  },

  // Get high scores for a specific game
  getHighScores: async (timeline, gameId, limit = 10) => {
    const sql = `
      SELECT u.display_name, mgs.score, mgs.completed_at
      FROM mini_game_scores mgs
      JOIN users u ON mgs.user_id = u.id
      WHERE mgs.timeline = ? AND mgs.game_id = ?
      ORDER BY mgs.score DESC, mgs.completed_at ASC
      LIMIT ?
    `;
    return query(sql, [timeline, gameId, limit]);
  },

  // Get user's best score for a game
  getUserBestScore: async (userId, timeline, gameId) => {
    const sql = `
      SELECT MAX(score) as best_score
      FROM mini_game_scores
      WHERE user_id = ? AND timeline = ? AND game_id = ?
    `;
    const results = await query(sql, [userId, timeline, gameId]);
    return results[0].best_score || 0;
  },

  // Find by ID
  findById: async (id) => {
    const sql = `
      SELECT mgs.*, u.display_name, u.username
      FROM mini_game_scores mgs
      JOIN users u ON mgs.user_id = u.id
      WHERE mgs.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  buildWhereClause,
  buildPagination,
  countQuery,
  testConnection,
  userDB,
  gameSessionDB,
  miniGameDB
};
