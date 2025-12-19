const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../timetravel.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        avatar_url VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1,
        is_verified BOOLEAN DEFAULT 0
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err.message);
    });

    // Game sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_name VARCHAR(100) DEFAULT 'Main Game',
        game_state TEXT NOT NULL,
        credits INTEGER DEFAULT 5000,
        energy INTEGER DEFAULT 100,
        max_energy INTEGER DEFAULT 100,
        stability INTEGER DEFAULT 75,
        max_stability INTEGER DEFAULT 100,
        coins_per_second INTEGER DEFAULT 0,
        current_era VARCHAR(20) DEFAULT 'dashboard',
        total_credits_earned INTEGER DEFAULT 0,
        time_played_seconds INTEGER DEFAULT 0,
        total_mini_games_played INTEGER DEFAULT 0,
        paradox_level INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Error creating game_sessions table:', err.message);
    });

    // Mini-game scores table
    db.run(`
      CREATE TABLE IF NOT EXISTS mini_game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        timeline VARCHAR(20) NOT NULL,
        game_id VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        rewards TEXT,
        duration_seconds INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (session_id) REFERENCES game_sessions(id)
      )
    `, (err) => {
      if (err) console.error('Error creating mini_game_scores table:', err.message);
    });

    // Resources table
    db.run(`
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        timeline VARCHAR(20) NOT NULL,
        influence INTEGER DEFAULT 0,
        artifacts INTEGER DEFAULT 0,
        coal INTEGER DEFAULT 0,
        metal INTEGER DEFAULT 0,
        mechanical_output INTEGER DEFAULT 0,
        technology INTEGER DEFAULT 0,
        money INTEGER DEFAULT 0,
        energy_grid INTEGER DEFAULT 0,
        efficiency INTEGER DEFAULT 0,
        innovations INTEGER DEFAULT 0,
        hyper_energy INTEGER DEFAULT 0,
        fusion_output INTEGER DEFAULT 0,
        ai_productivity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions(id)
      )
    `, (err) => {
      if (err) console.error('Error creating resources table:', err.message);
    });

    // Timeline stability table
    db.run(`
      CREATE TABLE IF NOT EXISTS timeline_stability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        timeline VARCHAR(20) NOT NULL,
        stability INTEGER DEFAULT 75,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions(id)
      )
    `, (err) => {
      if (err) console.error('Error creating timeline_stability table:', err.message);
    });

    // Random events history table
    db.run(`
      CREATE TABLE IF NOT EXISTS random_events_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        event_id VARCHAR(50) NOT NULL,
        event_data TEXT NOT NULL,
        choice_made VARCHAR(100),
        resolution TEXT,
        impact TEXT,
        triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions(id)
      )
    `, (err) => {
      if (err) console.error('Error creating random_events_history table:', err.message);
    });

    // Achievements table
    db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id VARCHAR(50) NOT NULL,
        achievement_data TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Error creating achievements table:', err.message);
    });

    // Leaderboards table
    db.run(`
      CREATE TABLE IF NOT EXISTS leaderboards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        leaderboard_type VARCHAR(50) NOT NULL,
        value INTEGER NOT NULL,
        rank_position INTEGER,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (session_id) REFERENCES game_sessions(id)
      )
    `, (err) => {
      if (err) console.error('Error creating leaderboards table:', err.message);
    });

    console.log('✅ Database schema initialized successfully');
  });
};

// Promise wrappers for SQLite operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// User database helpers
const userDB = {
  findById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
    return await get(sql, [id]);
  },

  findByUsernameOrEmail: async (username, email) => {
    const sql = `
      SELECT id, username, email, password_hash, display_name, avatar_url, 
             created_at, last_login, is_active, is_verified
      FROM users WHERE username = ? OR email = ?
    `;
    return await get(sql, [username, email]);
  },

  findByUsername: async (username) => {
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
    return await get(sql, [username]);
  },

  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
    return await get(sql, [email]);
  },

  create: async (userData) => {
    const { username, email, password_hash, display_name, avatar_url } = userData;
    const sql = `
      INSERT INTO users (username, email, password_hash, display_name, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await run(sql, [username, email, password_hash, display_name, avatar_url]);
    return { id: result.lastID, username, email, display_name, avatar_url };
  },

  updateLastLogin: async (id) => {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    return await run(sql, [id]);
  },

  update: async (id, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    const sql = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await run(sql, values);
  },

  verifyEmail: async (id) => {
    const sql = 'UPDATE users SET is_verified = 1 WHERE id = ?';
    return await run(sql, [id]);
  },

  deactivate: async (id) => {
    const sql = 'UPDATE users SET is_active = 0 WHERE id = ?';
    return await run(sql, [id]);
  },

  activate: async (id) => {
    const sql = 'UPDATE users SET is_active = 1 WHERE id = ?';
    return await run(sql, [id]);
  }
};

// Game session database helpers
const gameSessionDB = {
  findById: async (id) => {
    const sql = 'SELECT * FROM game_sessions WHERE id = ? AND is_active = 1';
    return await get(sql, [id]);
  },

  findActiveByUserId: async (userId) => {
    const sql = 'SELECT * FROM game_sessions WHERE user_id = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1';
    return await get(sql, [userId]);
  },

  findByUserId: async (userId) => {
    const sql = 'SELECT * FROM game_sessions WHERE user_id = ? AND is_active = 1 ORDER BY updated_at DESC';
    return await query(sql, [userId]);
  },

  create: async (userId, gameData) => {
    const { gameState, initialCredits = 5000 } = gameData;
    const sql = `
      INSERT INTO game_sessions (user_id, game_state, credits)
      VALUES (?, ?, ?)
    `;
    const result = await run(sql, [userId, JSON.stringify(gameState), initialCredits]);
    return gameSessionDB.findById(result.lastID);
  },

  update: async (id, updates) => {
    const fields = Object.keys(updates).map(key => {
      if (key === 'game_state') return 'game_state = ?';
      return `${key} = ?`;
    }).join(', ');
    
    const values = Object.values(updates).map(value => {
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });
    values.push(id);
    
    const sql = `UPDATE game_sessions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_active = 1`;
    return await run(sql, values);
  },

  deactivate: async (id) => {
    const sql = 'UPDATE game_sessions SET is_active = 0 WHERE id = ?';
    return await run(sql, [id]);
  }
};

// Mini-game scores database helpers
const miniGameDB = {
  findById: async (id) => {
    const sql = 'SELECT * FROM mini_game_scores WHERE id = ?';
    return await get(sql, [id]);
  },

  findByUserAndGame: async (userId, timeline, gameId) => {
    const sql = 'SELECT * FROM mini_game_scores WHERE user_id = ? AND timeline = ? AND game_id = ? ORDER BY score DESC LIMIT 10';
    return await query(sql, [userId, timeline, gameId]);
  },

  findHighScores: async (timeline, gameId, limit = 10) => {
    const sql = `
      SELECT mgs.*, u.display_name, u.username 
      FROM mini_game_scores mgs
      JOIN users u ON mgs.user_id = u.id
      WHERE mgs.timeline = ? AND mgs.game_id = ?
      ORDER BY mgs.score DESC
      LIMIT ?
    `;
    return await query(sql, [timeline, gameId, limit]);
  },

  findUserScores: async (userId) => {
    const sql = 'SELECT * FROM mini_game_scores WHERE user_id = ? ORDER BY completed_at DESC';
    return await query(sql, [userId]);
  },

  create: async (scoreData) => {
    const { user_id, session_id, timeline, game_id, score, rewards, duration_seconds } = scoreData;
    const sql = `
      INSERT INTO mini_game_scores (user_id, session_id, timeline, game_id, score, rewards, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await run(sql, [user_id, session_id, timeline, game_id, score, JSON.stringify(rewards), duration_seconds]);
    return miniGameDB.findById(result.lastID);
  },

  getUserStats: async (userId) => {
    const sql = `
      SELECT 
        COUNT(*) as total_games_played,
        SUM(score) as total_score,
        AVG(score) as average_score,
        MAX(score) as highest_score,
        COUNT(DISTINCT timeline) as timelines_played,
        COUNT(DISTINCT game_id) as games_played
      FROM mini_game_scores 
      WHERE user_id = ?
    `;
    return await get(sql, [userId]);
  }
};

// Resources database helpers
const resourcesDB = {
  findBySessionAndTimeline: async (sessionId, timeline) => {
    const sql = 'SELECT * FROM resources WHERE session_id = ? AND timeline = ?';
    return await get(sql, [sessionId, timeline]);
  },

  createOrUpdate: async (sessionId, timeline, resources) => {
    // Check if exists
    const existing = await resourcesDB.findBySessionAndTimeline(sessionId, timeline);
    
    if (existing) {
      // Update existing
      const fields = Object.keys(resources).map(key => `${key} = ?`).join(', ');
      const values = Object.values(resources);
      values.push(sessionId, timeline);
      const sql = `UPDATE resources SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE session_id = ? AND timeline = ?`;
      return await run(sql, values);
    } else {
      // Create new
      const fields = Object.keys(resources).join(', ');
      const placeholders = Object.keys(resources).map(() => '?').join(', ');
      const values = Object.values(resources);
      values.push(sessionId, timeline);
      const sql = `INSERT INTO resources (session_id, timeline, ${fields}) VALUES (?, ?, ${placeholders})`;
      return await run(sql, values);
    }
  }
};

// Timeline stability database helpers
const timelineStabilityDB = {
  findBySessionAndTimeline: async (sessionId, timeline) => {
    const sql = 'SELECT * FROM timeline_stability WHERE session_id = ? AND timeline = ?';
    return await get(sql, [sessionId, timeline]);
  },

  createOrUpdate: async (sessionId, timeline, stability) => {
    const existing = await timelineStabilityDB.findBySessionAndTimeline(sessionId, timeline);
    
    if (existing) {
      const sql = 'UPDATE timeline_stability SET stability = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ? AND timeline = ?';
      return await run(sql, [stability, sessionId, timeline]);
    } else {
      const sql = 'INSERT INTO timeline_stability (session_id, timeline, stability) VALUES (?, ?, ?)';
      return await run(sql, [sessionId, timeline, stability]);
    }
  }
};

// Random events history database helpers
const randomEventsDB = {
  create: async (eventData) => {
    const { session_id, event_id, event_data, choice_made, resolution, impact } = eventData;
    const sql = `
      INSERT INTO random_events_history (session_id, event_id, event_data, choice_made, resolution, impact)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await run(sql, [session_id, event_id, JSON.stringify(event_data), choice_made, JSON.stringify(resolution), JSON.stringify(impact)]);
    return result.lastID;
  },

  findBySession: async (sessionId, limit = 10) => {
    const sql = `
      SELECT * FROM random_events_history 
      WHERE session_id = ? 
      ORDER BY triggered_at DESC 
      LIMIT ?
    `;
    return await query(sql, [sessionId, limit]);
  }
};

// Achievements database helpers
const achievementsDB = {
  findByUserId: async (userId) => {
    const sql = 'SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC';
    return await query(sql, [userId]);
  },

  findByUserAndAchievement: async (userId, achievementId) => {
    const sql = 'SELECT * FROM achievements WHERE user_id = ? AND achievement_id = ?';
    return await get(sql, [userId, achievementId]);
  },

  create: async (userId, achievementId, achievementData) => {
    const sql = 'INSERT INTO achievements (user_id, achievement_id, achievement_data) VALUES (?, ?, ?)';
    const result = await run(sql, [userId, achievementId, JSON.stringify(achievementData)]);
    return result.lastID;
  },

  delete: async (userId, achievementId) => {
    const sql = 'DELETE FROM achievements WHERE user_id = ? AND achievement_id = ?';
    return await run(sql, [userId, achievementId]);
  }
};

// Leaderboards database helpers
const leaderboardDB = {
  findByType: async (type, limit = 50) => {
    const sql = `
      SELECT l.*, u.display_name, u.username, gs.current_era
      FROM leaderboards l
      JOIN users u ON l.user_id = u.id
      JOIN game_sessions gs ON l.session_id = gs.id
      WHERE l.leaderboard_type = ?
      ORDER BY l.value DESC, l.recorded_at ASC
      LIMIT ?
    `;
    return await query(sql, [type, limit]);
  },

  findUserRankings: async (userId) => {
    const sql = `
      SELECT 
        leaderboard_type,
        value,
        (SELECT COUNT(*) + 1 FROM leaderboards l2 WHERE l2.leaderboard_type = l.leaderboard_type AND l2.value > l.value) as rank
      FROM leaderboards l
      WHERE l.user_id = ?
      ORDER BY l.leaderboard_type
    `;
    return await query(sql, [userId]);
  },

  create: async (leaderboardData) => {
    const { user_id, session_id, leaderboard_type, value } = leaderboardData;
    const sql = 'INSERT INTO leaderboards (user_id, session_id, leaderboard_type, value) VALUES (?, ?, ?, ?)';
    const result = await run(sql, [user_id, session_id, leaderboard_type, value]);
    return result.lastID;
  }
};

module.exports = {
  db,
  query,
  run,
  get,
  userDB,
  gameSessionDB,
  miniGameDB,
  resourcesDB,
  timelineStabilityDB,
  randomEventsDB,
  achievementsDB,
  leaderboardDB
};

