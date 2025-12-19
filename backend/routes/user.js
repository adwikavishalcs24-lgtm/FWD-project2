const express = require('express');
const { body, validationResult } = require('express-validator');
const { userDB, gameSessionDB, miniGameDB } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userDB.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile could not be retrieved'
      });
    }

    // Get user's active game session
    const session = await gameSessionDB.findActiveByUserId(req.user.id);
    
    // Get user's mini-game statistics
    const userStatsSql = `
      SELECT 
        timeline,
        COUNT(*) as gamesPlayed,
        AVG(score) as averageScore,
        MAX(score) as bestScore
      FROM mini_game_scores
      WHERE user_id = ?
      GROUP BY timeline
    `;
    
    const { query } = require('../config/database');
    const timelineStats = await userStatsSql ? await query(userStatsSql, [req.user.id]) : [];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        last_login: user.last_login,
        is_verified: user.is_verified,
        is_active: user.is_active
      },
      gameSession: session ? {
        id: session.id,
        credits: session.credits,
        score: session.score,
        currentEra: session.current_era,
        totalMiniGamesPlayed: session.total_mini_games_played,
        timePlayed: session.time_played_seconds
      } : null,
      miniGameStats: timelineStats.map(stat => ({
        timeline: stat.timeline,
        gamesPlayed: stat.gamesPlayed,
        averageScore: Math.round(stat.averageScore || 0),
        bestScore: stat.bestScore || 0
      })),
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to Get Profile',
      message: 'Unable to retrieve user profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  authenticateToken,
  [
    body('display_name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Display name must be between 1 and 100 characters'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
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

      const { display_name, avatar_url, email } = req.body;
      const updates = {};

      if (display_name !== undefined) updates.display_name = display_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (email !== undefined) updates.email = email;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No Updates Provided',
          message: 'No valid fields provided for update'
        });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await userDB.findByUsernameOrEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({
            error: 'Email Already Taken',
            message: 'This email is already registered to another account'
          });
        }
      }

      const updatedUser = await userDB.updateProfile(req.user.id, updates);

      if (!updatedUser) {
        return res.status(404).json({
          error: 'User Not Found',
          message: 'Unable to update user profile'
        });
      }

      console.log(`Profile updated for user: ${req.user.username}`);

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          display_name: updatedUser.display_name,
          avatar_url: updatedUser.avatar_url,
          updated_at: updatedUser.updated_at
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to Update Profile',
        message: 'Unable to update user profile'
      });
    }
  }
);

// @route   GET /api/user/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const achievementsSql = `
      SELECT 
        achievement_id,
        achievement_data,
        unlocked_at
      FROM achievements
      WHERE user_id = ?
      ORDER BY unlocked_at DESC
    `;
    
    const { query } = require('../config/database');
    const achievements = await query(achievementsSql, [req.user.id]);

    // Define available achievements
    const availableAchievements = {
      'first_mini_game': {
        name: 'First Steps',
        description: 'Complete your first mini-game',
        icon: '🎮',
        category: 'progression'
      },
      'mini_game_master': {
        name: 'Mini-Game Master',
        description: 'Complete 10 mini-games',
        icon: '🏆',
        category: 'progression'
      },
      'high_scorer': {
        name: 'High Scorer',
        description: 'Score 500+ in any mini-game',
        icon: '⭐',
        category: 'skill'
      },
      'perfectionist': {
        name: 'Perfectionist',
        description: 'Score 1000 in any mini-game',
        icon: '💯',
        category: 'skill'
      },
      'time_traveler': {
        name: 'Time Traveler',
        description: 'Play mini-games from all three timelines',
        icon: '⏰',
        category: 'exploration'
      },
      'score_collector': {
        name: 'Score Collector',
        description: 'Earn 10,000 total credits',
        icon: '💰',
        category: 'wealth'
      },
      'persistent': {
        name: 'Persistent',
        description: 'Play for 1 hour total',
        icon: '⏱️',
        category: 'dedication'
      }
    };

    // Check which achievements user has earned
    const earnedAchievements = achievements.map(achievement => ({
      achievementId: achievement.achievement_id,
      data: achievement.achievement_data,
      unlockedAt: achievement.unlocked_at,
      info: availableAchievements[achievement.achievement_id] || {
        name: achievement.achievement_id,
        description: 'Unknown achievement',
        icon: '❓',
        category: 'unknown'
      }
    }));

    // Get user's progress towards unearned achievements
    const session = await gameSessionDB.findActiveByUserId(req.user.id);
    const progress = {
      totalMiniGames: session ? session.total_mini_games_played : 0,
      totalCredits: session ? session.total_credits_earned : 0,
      timePlayed: session ? session.time_played_seconds : 0,
      timelinesPlayed: [], // This would need additional tracking
      bestScore: session ? session.score : 0
    };

    // Calculate achievement progress
    const achievementProgress = {};
    Object.entries(availableAchievements).forEach(([id, achievement]) => {
      if (earnedAchievements.find(e => e.achievementId === id)) {
        achievementProgress[id] = { earned: true, progress: 100 };
      } else {
        let progressPercent = 0;
        
        switch (id) {
          case 'first_mini_game':
            progressPercent = Math.min(100, (progress.totalMiniGames / 1) * 100);
            break;
          case 'mini_game_master':
            progressPercent = Math.min(100, (progress.totalMiniGames / 10) * 100);
            break;
          case 'high_scorer':
            progressPercent = Math.min(100, (progress.bestScore / 500) * 100);
            break;
          case 'perfectionist':
            progressPercent = Math.min(100, (progress.bestScore / 1000) * 100);
            break;
          case 'score_collector':
            progressPercent = Math.min(100, (progress.totalCredits / 10000) * 100);
            break;
          case 'persistent':
            progressPercent = Math.min(100, (progress.timePlayed / 3600) * 100);
            break;
          default:
            progressPercent = 0;
        }
        
        achievementProgress[id] = { earned: false, progress: Math.round(progressPercent) };
      }
    });

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.display_name
      },
      achievements: earnedAchievements,
      progress: achievementProgress,
      totalEarned: earnedAchievements.length,
      totalAvailable: Object.keys(availableAchievements).length,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      error: 'Failed to Get Achievements',
      message: 'Unable to retrieve user achievements'
    });
  }
});

// @route   GET /api/user/statistics
// @desc    Get detailed user statistics
// @access  Private
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const session = await gameSessionDB.findActiveByUserId(req.user.id);
    
    // Get mini-game statistics by timeline
    const miniGameStatsSql = `
      SELECT 
        timeline,
        game_id,
        COUNT(*) as timesPlayed,
        AVG(score) as averageScore,
        MAX(score) as bestScore,
        SUM(duration_seconds) as totalTime
      FROM mini_game_scores
      WHERE user_id = ?
      GROUP BY timeline, game_id
      ORDER BY timeline, game_id
    `;
    
    const { query } = require('../config/database');
    const gameStats = await query(miniGameStatsSql, [req.user.id]);

    // Get recent activity
    const recentActivitySql = `
      SELECT 
        'mini_game' as type,
        timeline,
        game_id,
        score,
        completed_at as timestamp
      FROM mini_game_scores
      WHERE user_id = ?
      UNION ALL
      SELECT 
        'session' as type,
        current_era as timeline,
        'game_session' as game_id,
        score,
        updated_at as timestamp
      FROM game_sessions
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY timestamp DESC
      LIMIT 10
    `;
    
    const recentActivity = await query(recentActivitySql, [req.user.id, req.user.id]);

    const statistics = {
      gameSession: session ? {
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
        lastPlayed: session.updated_at
      } : null,
      miniGames: {
        totalPlayed: gameStats.reduce((sum, stat) => sum + stat.timesPlayed, 0),
        averageScore: gameStats.length > 0 
          ? Math.round(gameStats.reduce((sum, stat) => sum + stat.averageScore, 0) / gameStats.length)
          : 0,
        bestScore: gameStats.length > 0 
          ? Math.max(...gameStats.map(stat => stat.bestScore))
          : 0,
        totalTimePlayed: gameStats.reduce((sum, stat) => sum + (stat.totalTime || 0), 0),
        timelineBreakdown: gameStats.reduce((acc, stat) => {
          if (!acc[stat.timeline]) {
            acc[stat.timeline] = { gamesPlayed: 0, totalScore: 0, totalTime: 0 };
          }
          acc[stat.timeline].gamesPlayed += stat.timesPlayed;
          acc[stat.timeline].totalScore += stat.averageScore * stat.timesPlayed;
          acc[stat.timeline].totalTime += stat.totalTime || 0;
          return acc;
        }, {}),
        gameBreakdown: gameStats
      },
      recentActivity,
      memberSince: req.user.created_at,
      lastLogin: req.user.last_login,
      updatedAt: new Date().toISOString()
    };

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.display_name
      },
      statistics,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      error: 'Failed to Get Statistics',
      message: 'Unable to retrieve user statistics'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', 
  authenticateToken,
  [
    body('password').notEmpty().withMessage('Password is required to delete account'),
    body('confirmation').equals('DELETE').withMessage('Confirmation text must be "DELETE"')
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

      const { password } = req.body;

      // Get user with password hash
      const user = await userDB.findByUsernameOrEmail(req.user.username);
      if (!user) {
        return res.status(404).json({
          error: 'User Not Found',
          message: 'User account not found'
        });
      }

      // Verify password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid Password',
          message: 'Password is incorrect'
        });
      }

      // Note: In a production environment, you might want to:
      // 1. Soft delete (mark as inactive) instead of hard delete
      // 2. Anonymize data instead of deleting
      // 3. Require additional verification steps
      
      // For now, we'll mark the account as inactive (soft delete)
      await userDB.updateProfile(req.user.id, { is_active: false });

      console.log(`Account deactivated for user: ${req.user.username}`);

      res.json({
        message: 'Account deactivated successfully',
        deactivatedAt: new Date().toISOString(),
        note: 'Your account has been deactivated. Contact support if you wish to reactivate.'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        error: 'Failed to Delete Account',
        message: 'Unable to delete account'
      });
    }
  }
);

module.exports = router;
