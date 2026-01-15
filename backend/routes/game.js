const express = require('express');
const { body, validationResult } = require('express-validator');

const { gameSessionDB } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/game/session
// @desc    Get user's current game session
// @access  Private
router.get('/session', authenticateToken, async (req, res) => {
  try {
    const session = await gameSessionDB.findActiveByUserId(req.user.id);
    
    if (!session) {
      return res.status(404).json({
        error: 'No Active Session',
        message: 'No active game session found. Please start a new game.'
      });
    }

    // Parse game_state JSON
    const gameState = typeof session.game_state === 'string' 
      ? JSON.parse(session.game_state) 
      : session.game_state;

    res.json({
      session: {
        id: session.id,
        gameState,
        credits: session.credits,
        energy: session.energy,
        max_energy: session.max_energy,
        stability: session.stability,
        max_stability: session.max_stability,
        coins_per_second: session.coins_per_second,
        current_era: session.current_era,
        total_credits_earned: session.total_credits_earned,
        time_played_seconds: session.time_played_seconds,
        total_mini_games_played: session.total_mini_games_played,
        paradox_level: session.paradox_level,
        score: session.score,
        created_at: session.created_at,
        updated_at: session.updated_at
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Failed to Get Session',
      message: 'Unable to retrieve game session'
    });
  }
});

// @route   POST /api/game/session
// @desc    Create new game session
// @access  Private
router.post('/session', 
  authenticateToken,
  [
    body('gameState').isObject().withMessage('Game state must be an object'),
    body('initialCredits').optional().isInt({ min: 0 }).withMessage('Initial credits must be a positive integer')
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

      const { gameState, initialCredits = 5000 } = req.body;

      // Check if user already has an active session
      const existingSession = await gameSessionDB.findActiveByUserId(req.user.id);
      if (existingSession) {
        return res.status(409).json({
          error: 'Session Already Exists',
          message: 'You already have an active game session'
        });
      }

      const newSession = await gameSessionDB.create(req.user.id, {
        ...gameState,
        initialCredits
      });

      console.log(`New game session created for user ${req.user.username}`);

      res.status(201).json({
        message: 'Game session created successfully',
        session: {
          id: newSession.id,
          credits: newSession.credits,
          energy: newSession.energy,
          max_energy: newSession.max_energy,
          stability: newSession.stability,
          max_stability: newSession.max_stability,
          coins_per_second: newSession.coins_per_second,
          current_era: newSession.current_era,
          total_credits_earned: newSession.total_credits_earned,
          time_played_seconds: newSession.time_played_seconds,
          total_mini_games_played: newSession.total_mini_games_played,
          paradox_level: newSession.paradox_level,
          score: newSession.score
        }
      });

    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        error: 'Failed to Create Session',
        message: 'Unable to create game session'
      });
    }
  }
);

// @route   PUT /api/game/session
// @desc    Update current game session
// @access  Private
router.put('/session',
  authenticateToken,
  [
    body('gameState').optional().isObject().withMessage('Game state must be an object'),
    body('credits').optional().isInt({ min: 0 }).withMessage('Credits must be a positive integer'),
    body('energy').optional().isInt({ min: 0 }).withMessage('Energy must be a positive integer'),
    body('stability').optional().isInt({ min: 0, max: 100 }).withMessage('Stability must be between 0 and 100'),
    body('current_era').optional().isString().withMessage('Current era must be a string'),
    body('score').optional().isInt({ min: 0 }).withMessage('Score must be a positive integer')
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

      const session = await gameSessionDB.findActiveByUserId(req.user.id);
      if (!session) {
        return res.status(404).json({
          error: 'No Active Session',
          message: 'No active game session found'
        });
      }

      const updates = req.body;
      
      // If gameState is provided, merge it with existing game_state
      if (updates.gameState) {
        const currentGameState = typeof session.game_state === 'string' 
          ? JSON.parse(session.game_state) 
          : session.game_state;
        
        updates.gameState = {
          ...currentGameState,
          ...updates.gameState
        };
      }

      const updatedSession = await gameSessionDB.update(session.id, updates);

      if (!updatedSession) {
        return res.status(404).json({
          error: 'Session Not Found',
          message: 'Unable to update session'
        });
      }

      // Parse game_state for response
      const gameState = typeof updatedSession.game_state === 'string' 
        ? JSON.parse(updatedSession.game_state) 
        : updatedSession.game_state;

      res.json({
        message: 'Session updated successfully',
        session: {
          id: updatedSession.id,
          gameState,
          credits: updatedSession.credits,
          energy: updatedSession.energy,
          max_energy: updatedSession.max_energy,
          stability: updatedSession.stability,
          max_stability: updatedSession.max_stability,
          coins_per_second: updatedSession.coins_per_second,
          current_era: updatedSession.current_era,
          total_credits_earned: updatedSession.total_credits_earned,
          time_played_seconds: updatedSession.time_played_seconds,
          total_mini_games_played: updatedSession.total_mini_games_played,
          paradox_level: updatedSession.paradox_level,
          score: updatedSession.score,
          updated_at: updatedSession.updated_at
        }
      });

    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        error: 'Failed to Update Session',
        message: 'Unable to update game session'
      });
    }
  }
);

// @route   POST /api/game/session/end
// @desc    End current game session
// @access  Private
router.post('/session/end', authenticateToken, async (req, res) => {
  try {
    const session = await gameSessionDB.findActiveByUserId(req.user.id);
    if (!session) {
      return res.status(404).json({
        error: 'No Active Session',
        message: 'No active game session found'
      });
    }

    // Mark session as inactive (soft delete)
    await gameSessionDB.update(session.id, { is_active: false });

    console.log(`Game session ended for user ${req.user.username}`);

    res.json({
      message: 'Game session ended successfully',
      finalStats: {
        totalCreditsEarned: session.total_credits_earned,
        totalMiniGamesPlayed: session.total_mini_games_played,
        finalScore: session.score,
        timePlayed: session.time_played_seconds
      }
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      error: 'Failed to End Session',
      message: 'Unable to end game session'
    });
  }
});

// @route   GET /api/game/stats
// @desc    Get user's game statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const session = await gameSessionDB.findActiveByUserId(req.user.id);
    
    if (!session) {
      return res.status(404).json({
        error: 'No Active Session',
        message: 'No active game session found'
      });
    }

    const stats = {
      credits: session.credits,
      totalCreditsEarned: session.total_credits_earned,
      energy: session.energy,
      maxEnergy: session.max_energy,
      stability: session.stability,
      maxStability: session.max_stability,
      coinsPerSecond: session.coins_per_second,
      currentEra: session.current_era,
      timePlayed: session.time_played_seconds,
      totalMiniGamesPlayed: session.total_mini_games_played,
      paradoxLevel: session.paradox_level,
      score: session.score,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to Get Stats',
      message: 'Unable to retrieve game statistics'
    });
  }
});

// @route   POST /api/game/save-progress
// @desc    Save current game progress
// @access  Private
router.post('/save-progress', 
  authenticateToken,
  [
    body('gameData').isObject().withMessage('Game data must be an object'),
    body('saveName').optional().isString().withMessage('Save name must be a string')
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

      const { gameData, saveName = 'Quick Save' } = req.body;

      const session = await gameSessionDB.findActiveByUserId(req.user.id);
      if (!session) {
        return res.status(404).json({
          error: 'No Active Session',
          message: 'No active game session found'
        });
      }

      const updatedSession = await gameSessionDB.update(session.id, {
        game_state: gameData,
        session_name: saveName
      });

      res.json({
        message: 'Progress saved successfully',
        saveName,
        savedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Save progress error:', error);
      res.status(500).json({
        error: 'Failed to Save Progress',
        message: 'Unable to save game progress'
      });
    }
  }
);

module.exports = router;
