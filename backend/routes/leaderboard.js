const express = require('express');

const { query } = require('../config/database-sqlite');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leaderboard/score
// @desc    Get top scores leaderboard
// @access  Public
router.get('/score', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const sql = `
      SELECT 
        u.display_name,
        u.username,
        gs.score,
        gs.total_credits_earned,
        gs.total_mini_games_played,
        gs.updated_at as last_played
      FROM game_sessions gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.is_active = TRUE
      ORDER BY gs.score DESC
      LIMIT ?
    `;
    
    const leaderboard = await query(sql, [limit]);

    res.json({
      leaderboard,
      totalEntries: leaderboard.length,
      type: 'score',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Score leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to Get Score Leaderboard',
      message: 'Unable to retrieve score leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/mini-games
// @desc    Get mini-games played leaderboard
// @access  Public
router.get('/mini-games', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const sql = `
      SELECT 
        u.display_name,
        u.username,
        gs.total_mini_games_played,
        gs.total_credits_earned,
        gs.updated_at as last_played
      FROM game_sessions gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.is_active = TRUE
      ORDER BY gs.total_mini_games_played DESC, gs.updated_at ASC
      LIMIT ?
    `;
    
    const leaderboard = await query(sql, [limit]);

    res.json({
      leaderboard,
      totalEntries: leaderboard.length,
      type: 'mini_games',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mini-games leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to Get Mini-Games Leaderboard',
      message: 'Unable to retrieve mini-games leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/time-played
// @desc    Get time played leaderboard
// @access  Public
router.get('/time-played', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const sql = `
      SELECT 
        u.display_name,
        u.username,
        gs.time_played_seconds,
        gs.total_mini_games_played,
        gs.updated_at as last_played
      FROM game_sessions gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.is_active = TRUE
      ORDER BY gs.time_played_seconds DESC, gs.updated_at ASC
      LIMIT ?
    `;
    
    const leaderboard = await query(sql, [limit]);

    res.json({
      leaderboard,
      totalEntries: leaderboard.length,
      type: 'time_played',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Time played leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to Get Time Played Leaderboard',
      message: 'Unable to retrieve time played leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/mini-game/:timeline/:gameId
// @desc    Get leaderboard for specific mini-game
// @access  Public
router.get('/mini-game/:timeline/:gameId', optionalAuth, async (req, res) => {
  try {
    const { timeline, gameId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!['past', 'present', 'future'].includes(timeline)) {
      return res.status(400).json({
        error: 'Invalid Timeline',
        message: 'Timeline must be one of: past, present, future'
      });
    }
    
    const sql = `
      SELECT 
        u.display_name,
        u.username,
        mgs.score,
        mgs.duration_seconds,
        mgs.completed_at
      FROM mini_game_scores mgs
      JOIN users u ON mgs.user_id = u.id
      WHERE mgs.timeline = ? AND mgs.game_id = ?
      ORDER BY mgs.score DESC, mgs.completed_at ASC
      LIMIT ?
    `;
    
    const leaderboard = await query(sql, [timeline, gameId, limit]);

    res.json({
      leaderboard,
      totalEntries: leaderboard.length,
      type: 'mini_game',
      gameInfo: {
        timeline,
        gameId
      },
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mini-game leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to Get Mini-Game Leaderboard',
      message: 'Unable to retrieve mini-game leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's ranking across all leaderboards
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only view their own ranking or if they're admin
    if (parseInt(userId) !== req.user.id && req.user.username !== 'admin') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only view your own rankings'
      });
    }

    // Get user's score ranking
    const scoreRankingSql = `
      SELECT COUNT(*) + 1 as rank
      FROM game_sessions gs
      WHERE gs.is_active = TRUE AND gs.score > (
        SELECT score FROM game_sessions 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY score DESC LIMIT 1
      )
    `;
    
    // Get user's mini-games ranking
    const miniGamesRankingSql = `
      SELECT COUNT(*) + 1 as rank
      FROM game_sessions gs
      WHERE gs.is_active = TRUE AND gs.total_mini_games_played > (
        SELECT total_mini_games_played FROM game_sessions 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY total_mini_games_played DESC LIMIT 1
      )
    `;
    
    // Get user's time played ranking
    const timeRankingSql = `
      SELECT COUNT(*) + 1 as rank
      FROM game_sessions gs
      WHERE gs.is_active = TRUE AND gs.time_played_seconds > (
        SELECT time_played_seconds FROM game_sessions 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY time_played_seconds DESC LIMIT 1
      )
    `;

    const [scoreRank] = await query(scoreRankingSql, [userId]);
    const [miniGamesRank] = await query(miniGamesRankingSql, [userId]);
    const [timeRank] = await query(timeRankingSql, [userId]);

    res.json({
      userId,
      rankings: {
        score: scoreRank.rank,
        miniGames: miniGamesRank.rank,
        timePlayed: timeRank.rank
      },
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('User ranking error:', error);
    res.status(500).json({
      error: 'Failed to Get User Ranking',
      message: 'Unable to retrieve user ranking'
    });
  }
});

// @route   GET /api/leaderboard/global-stats
// @desc    Get global game statistics
// @access  Public
router.get('/global-stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(DISTINCT gs.user_id) as totalPlayers,
        COUNT(gs.id) as totalGameSessions,
        SUM(gs.score) as totalScore,
        SUM(gs.total_mini_games_played) as totalMiniGamesPlayed,
        SUM(gs.time_played_seconds) as totalTimePlayed,
        AVG(gs.score) as averageScore,
        MAX(gs.score) as highestScore
      FROM game_sessions gs
      WHERE gs.is_active = TRUE
    `;
    
    const [stats] = await query(sql);
    
    // Format time played to human readable
    const totalTimeInHours = Math.floor(stats.totalTimePlayed / 3600);
    const totalTimeInMinutes = Math.floor((stats.totalTimePlayed % 3600) / 60);
    
    res.json({
      totalPlayers: stats.totalPlayers || 0,
      totalGameSessions: stats.totalGameSessions || 0,
      totalScore: stats.totalScore || 0,
      totalMiniGamesPlayed: stats.totalMiniGamesPlayed || 0,
      totalTimePlayed: {
        seconds: stats.totalTimePlayed || 0,
        formatted: `${totalTimeInHours}h ${totalTimeInMinutes}m`,
        hours: totalTimeInHours,
        minutes: totalTimeInMinutes
      },
      averageScore: Math.round(stats.averageScore || 0),
      highestScore: stats.highestScore || 0,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Global stats error:', error);
    res.status(500).json({
      error: 'Failed to Get Global Stats',
      message: 'Unable to retrieve global statistics'
    });
  }
});

// @route   GET /api/leaderboard/recent-games
// @desc    Get recently completed games
// @access  Public
router.get('/recent-games', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const sql = `
      SELECT 
        u.display_name,
        u.username,
        gs.score,
        gs.total_credits_earned,
        gs.total_mini_games_played,
        gs.updated_at as completed_at
      FROM game_sessions gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.is_active = TRUE
      ORDER BY gs.updated_at DESC
      LIMIT ?
    `;
    
    const recentGames = await query(sql, [limit]);

    res.json({
      recentGames,
      totalEntries: recentGames.length,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recent games error:', error);
    res.status(500).json({
      error: 'Failed to Get Recent Games',
      message: 'Unable to retrieve recent games'
    });
  }
});

module.exports = router;
