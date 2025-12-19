const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { userDB } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('display_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be between 1 and 100 characters')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  registerValidation,
  auditLog('user_registration'),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Please check your input data',
          details: errors.array()
        });
      }

      const { username, email, password, display_name } = req.body;

      // Check if user already exists
      const existingUser = await userDB.findByUsernameOrEmail(username);
      if (existingUser) {
        return res.status(409).json({
          error: 'User Already Exists',
          message: existingUser.username === username 
            ? 'Username is already taken' 
            : 'Email is already registered'
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        email,
        password_hash,
        display_name: display_name || username
      };

      const newUser = await userDB.create(userData);

      // Generate token
      const token = generateToken(newUser.id);

      // Update last login
      await userDB.updateLastLogin(newUser.id);

      console.log(`New user registered: ${newUser.username} (${newUser.email})`);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          display_name: newUser.display_name,
          created_at: newUser.created_at
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration Failed',
        message: 'Unable to create account. Please try again.'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login',
  loginValidation,
  auditLog('user_login'),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Please provide valid credentials',
          details: errors.array()
        });
      }

      const { username, password } = req.body;

      // Find user by username or email
      const user = await userDB.findByUsernameOrEmail(username);
      if (!user) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid username/email or password'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          error: 'Account Inactive',
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid username/email or password'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Update last login
      await userDB.updateLastLogin(user.id);

      console.log(`User logged in: ${user.username} (${user.email})`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          last_login: user.last_login,
          created_at: user.created_at,
          is_verified: user.is_verified
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login Failed',
        message: 'Unable to authenticate. Please try again.'
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await userDB.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User information could not be retrieved'
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        last_login: user.last_login,
        created_at: user.created_at,
        is_verified: user.is_verified,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      error: 'Failed to Retrieve User Info',
      message: 'Unable to get user information'
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token validity
// @access  Private
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      display_name: req.user.display_name,
      is_verified: req.user.is_verified
    }
  });
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user.id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token Refresh Failed',
      message: 'Unable to refresh token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, auditLog('user_logout'), (req, res) => {
  // Note: JWT tokens are stateless, so logout is handled client-side
  // In a production app, you might want to maintain a blacklist of tokens
  console.log(`User logged out: ${req.user.username}`);
  
  res.json({
    message: 'Logged out successfully'
  });
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
  authenticateToken,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
  ],
  auditLog('password_change'),
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

      const { current_password, new_password } = req.body;
      
      // Get user with password hash
      const user = await userDB.findByUsernameOrEmail(req.user.username);
      if (!user) {
        return res.status(404).json({
          error: 'User Not Found',
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid Password',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const new_password_hash = await bcrypt.hash(new_password, saltRounds);

      // Update password
      await userDB.updateProfile(user.id, { password_hash: new_password_hash });

      console.log(`Password changed for user: ${req.user.username}`);

      res.json({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Password Change Failed',
        message: 'Unable to change password. Please try again.'
      });
    }
  }
);

module.exports = router;
