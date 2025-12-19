const express = require('express');
const { body, validationResult } = require('express-validator');
const { miniGameDB, gameSessionDB } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Available mini-games configuration
const MINI_GAMES_CONFIG = {
  past: {
    'blacksmith-forge': { name: 'Blacksmith Forge Simulator', maxScore: 1000 },
    'steam-engine': { name: 'Steam Engine Pressure Control', maxScore: 1000 },
    'clockmaker': { name: 'Ancient Clockmaker Alignment', maxScore: 1000 },
    'telegraph': { name: 'Telegraph Morse Decoder', maxScore: 1000 }
  },
  present: {
    'traffic-signal': { name: 'Traffic Signal Controller', maxScore: 1000 },
    'stock-market': { name: 'Stock Market Decision Game', maxScore: 1000 },
    'energy-grid': { name: 'Energy Grid Balancer', maxScore: 1000 }
  },
  future: {
    'time-rift': { name: 'Time Rift Stabilizer', maxScore: 1000 },
    'ai-defense': { name: 'AI Defense Matrix', maxScore: 1000 },
    'fusion-reactor': { name: 'Fusion Reactor Control', maxScore: 1000 }
  }
};

// @route   POST /api/mini-games/submit-score
// @desc    Submit mini-game score
// @access  Private
router.post('/submit-score',
  authenticateToken,
  [
    body('timeline').isIn(['past', 'present', 'future']).withMessage('Invalid timeline'),
    body('gameId').isString().withMessage('Game ID is required'),
    body('score').isInt({ min: 0, max: 1000 }).withMessage('Score must be between 0 and 1000'),
    body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
    body('rewards').optional().isObject().withMessage('Rewards must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Please check your input data',
          details: errors.array()
        });
      }

      const { timeline, gameId, score, duration = 0, rewards = {} } = req.body;

      // Find game by name or ID
      const timelineGames = MINI_GAMES_CONFIG[timeline];
      if (!timelineGames) {
        return res.status(400).json({
          error: 'Invalid Timeline',
          message: `Timeline '${timeline}' does not exist`
        });
      }

      // Check if gameId is a key or a name
      let actualGameId = gameId;
      let gameConfig = timelineGames[gameId];
      if (!gameConfig) {
        // Try to find by name
        const found = Object.entries(timelineGames).find(([key, config]) => config.name === gameId);
        if (found) {
          actualGameId = found[0];
          gameConfig = found[1];
        }
      }

      if (!gameConfig) {
        return res.status(400).json({
          error: 'Invalid Game',
          message: `Mini-game '${gameId}' does not exist in ${timeline} timeline`
        });
      }

      // Get user's active game session
      const session = await gameSessionDB.findActiveByUserId(req.user.id);
      if (!session) {
        return res.status(404).json({
          error: 'No Active Session',
          message: 'No active game session found. Please start a game first.'
        });
      }

      // Save mini-game score
      const miniGameScore = await miniGameDB.saveScore(
        req.user.id,
        session.id,
        timeline,
        actualGameId,
        score,
        rewards,
        duration
      );

      // Update game session statistics
      const updatedSession = await gameSessionDB.update(session.id, {
        total_mini_games_played: session.total_mini_games_played + 1,
        score: Math.max(session.score, score), // Keep highest score
        total_credits_earned: session.total_credits_earned + (score * 10), // Award credits based on score
        coins_per_second: session.coins_per_second + Math.floor(score / 100) // Bonus coins per second
      });

      // Get user's best score for this game
      const userBestScore = await miniGameDB.getUserBestScore(req.user.id, timeline, actualGameId);

      console.log(`Mini-game score submitted: ${req.user.username} - ${timeline}/${actualGameId} - Score: ${score}`);

      res.status(201).json({
        message: 'Score submitted successfully',
        score: {
          id: miniGameScore.id,
          timeline,
          gameId: actualGameId,
          gameName: gameConfig.name,
          score,
          duration,
          rewards,
          completedAt: miniGameScore.completed_at,
          isPersonalBest: score === userBestScore
        },
        session: {
          totalMiniGamesPlayed: updatedSession.total_mini_games_played,
          totalCreditsEarned: updatedSession.total_credits_earned,
          coinsPerSecond: updatedSession.coins_per_second,
          overallScore: updatedSession.score
        }
      });

    } catch (error) {
      console.error('Submit score error:', error);
      res.status(500).json({
        error: 'Failed to Submit Score',
        message: 'Unable to submit mini-game score'
      });
    }
  }
);

// @route   GET /api/mini-games/high-scores/:timeline/:gameId
// @desc    Get high scores for specific mini-game
// @access  Public
router.get('/high-scores/:timeline/:gameId', async (req, res) => {
  try {
    const { timeline, gameId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!['past', 'present', 'future'].includes(timeline)) {
      return res.status(400).json({
        error: 'Invalid Timeline',
        message: 'Timeline must be one of: past, present, future'
      });
    }

    if (!MINI_GAMES_CONFIG[timeline] || !MINI_GAMES_CONFIG[timeline][gameId]) {
      return res.status(400).json({
        error: 'Invalid Game',
        message: `Mini-game '${gameId}' does not exist in ${timeline} timeline`
      });
    }

    const highScores = await miniGameDB.getHighScores(timeline, gameId, limit);

    res.json({
      gameInfo: {
        timeline,
        gameId,
        name: MINI_GAMES_CONFIG[timeline][gameId].name,
        maxScore: MINI_GAMES_CONFIG[timeline][gameId].maxScore
      },
      highScores,
      totalEntries: highScores.length,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get high scores error:', error);
    res.status(500).json({
      error: 'Failed to Get High Scores',
      message: 'Unable to retrieve high scores'
    });
  }
});

// @route   GET /api/mini-games/user-scores/:timeline/:gameId
// @desc    Get user's scores for specific mini-game
// @access  Private
router.get('/user-scores/:timeline/:gameId', authenticateToken, async (req, res) => {
  try {
    const { timeline, gameId } = req.params;
    
    if (!['past', 'present', 'future'].includes(timeline)) {
      return res.status(400).json({
        error: 'Invalid Timeline',
        message: 'Timeline must be one of: past, present, future'
      });
    }

    const bestScore = await miniGameDB.getUserBestScore(req.user.id, timeline, gameId);

    // Get user's recent scores for this game
    const recentScoresSql = `
      SELECT score, duration_seconds, completed_at
      FROM mini_game_scores
      WHERE user_id = ? AND timeline = ? AND game_id = ?
      ORDER BY completed_at DESC
      LIMIT 10
    `;
    
    const { query: dbQuery } = require('../config/database');
    const recentScores = await dbQuery(recentScoresSql, [req.user.id, timeline, gameId]);

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.display_name
      },
      gameInfo: {
        timeline,
        gameId,
        name: MINI_GAMES_CONFIG[timeline][gameId]?.name || gameId,
        maxScore: MINI_GAMES_CONFIG[timeline][gameId]?.maxScore || 1000
      },
      bestScore,
      recentScores,
      totalGamesPlayed: recentScores.length,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      error: 'Failed to Get User Scores',
      message: 'Unable to retrieve user scores'
    });
  }
});

// @route   GET /api/mini-games/available
// @desc    Get list of available mini-games
// @access  Public
router.get('/available', async (req, res) => {
  try {
    const availableGames = {};

    Object.entries(MINI_GAMES_CONFIG).forEach(([timeline, games]) => {
      availableGames[timeline] = Object.entries(games).map(([gameId, config]) => ({
        gameId,
        name: config.name,
        maxScore: config.maxScore
      }));
    });

    res.json({
      availableGames,
      totalGames: Object.values(MINI_GAMES_CONFIG).reduce((total, timeline) => 
        total + Object.keys(timeline).length, 0
      ),
      timelines: ['past', 'present', 'future'],
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get available games error:', error);
    res.status(500).json({
      error: 'Failed to Get Available Games',
      message: 'Unable to retrieve available mini-games'
    });
  }
});

// @route   GET /api/mini-games/user-stats
// @desc    Get user's mini-game statistics
// @access  Private
router.get('/user-stats', authenticateToken, async (req, res) => {
  try {
    const userStatsSql = `
      SELECT 
        timeline,
        COUNT(*) as gamesPlayed,
        AVG(score) as averageScore,
        MAX(score) as bestScore,
        SUM(duration_seconds) as totalTimePlayed
      FROM mini_game_scores
      WHERE user_id = ?
      GROUP BY timeline
    `;
    
    const { query: dbQuery } = require('../config/database');
    const timelineStats = await dbQuery(userStatsSql, [req.user.id]);

    // Get overall statistics
    const overallStatsSql = `
      SELECT 
        COUNT(*) as totalGamesPlayed,
        AVG(score) as overallAverageScore,
        MAX(score) as overallBestScore,
        SUM(duration_seconds) as totalTimePlayed
      FROM mini_game_scores
      WHERE user_id = ?
    `;
    
    const [overallStats] = await dbQuery(overallStatsSql, [req.user.id]);

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.display_name
      },
      overall: {
        totalGamesPlayed: overallStats.totalGamesPlayed || 0,
        overallAverageScore: Math.round(overallStats.overallAverageScore || 0),
        overallBestScore: overallStats.overallBestScore || 0,
        totalTimePlayed: overallStats.totalTimePlayed || 0
      },
      timelineStats: timelineStats.map(stat => ({
        timeline: stat.timeline,
        gamesPlayed: stat.gamesPlayed,
        averageScore: Math.round(stat.averageScore || 0),
        bestScore: stat.bestScore || 0,
        totalTimePlayed: stat.totalTimePlayed || 0
      })),
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to Get User Stats',
      message: 'Unable to retrieve user statistics'
    });
  }
});

// @route   POST /api/mini-games/validate-score
// @desc    Validate mini-game score before submission
// @access  Private
router.post('/validate-score',
  authenticateToken,
  [
    body('timeline').isIn(['past', 'present', 'future']).withMessage('Invalid timeline'),
    body('gameId').isString().withMessage('Game ID is required'),
    body('score').isInt({ min: 0, max: 1000 }).withMessage('Score must be between 0 and 1000')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Please check your input data',
          details: errors.array()
        });
      }

      const { timeline, gameId, score } = req.body;

      // Validate that the game exists in this timeline
      if (!MINI_GAMES_CONFIG[timeline] || !MINI_GAMES_CONFIG[timeline][gameId]) {
        return res.status(400).json({
          error: 'Invalid Game',
          message: `Mini-game '${gameId}' does not exist in ${timeline} timeline`
        });
      }

      // Check if this would be a new personal best
      const currentBest = await miniGameDB.getUserBestScore(req.user.id, timeline, gameId);
      const isNewPersonalBest = score > currentBest;

      // Calculate potential rewards
      const baseCredits = score * 10;
      const bonusMultiplier = isNewPersonalBest ? 1.5 : 1.0;
      const totalCredits = Math.floor(baseCredits * bonusMultiplier);
      const coinsPerSecondBonus = Math.floor(score / 100);

      res.json({
        valid: true,
        score: {
          submitted: score,
          currentBest,
          isNewPersonalBest,
          potentialNewBest: Math.max(score, currentBest)
        },
        rewards: {
          baseCredits,
          bonusMultiplier: isNewPersonalBest ? 1.5 : 1.0,
          totalCredits,
          coinsPerSecondBonus
        },
        gameInfo: {
          timeline,
          gameId,
          name: MINI_GAMES_CONFIG[timeline][gameId].name,
          maxScore: MINI_GAMES_CONFIG[timeline][gameId].maxScore
        },
        validatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Validate score error:', error);
      res.status(500).json({
        error: 'Failed to Validate Score',
        message: 'Unable to validate score'
      });
    }
  }
);

module.exports = router;
