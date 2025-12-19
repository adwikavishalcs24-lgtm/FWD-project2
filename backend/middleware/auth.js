const jwt = require('jsonwebtoken');

const { userDB } = require('../config/database-sqlite');

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await userDB.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'User not found or inactive'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account Inactive',
        message: 'Your account has been deactivated'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      is_verified: user.is_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Token is malformed or invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Authentication token has expired',
        expired: true
      });
    }
    
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Failed to authenticate token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userDB.findById(decoded.userId);
    
    req.user = user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      is_verified: user.is_verified
    } : null;

    next();
  } catch (error) {
    // Don't fail on invalid tokens, just set user to null
    req.user = null;
    next();
  }
};

// Middleware to check if user is verified (for certain features)
const requireVerification = (req, res, next) => {
  if (!req.user?.is_verified) {
    return res.status(403).json({
      error: 'Verification Required',
      message: 'Email verification is required to access this feature'
    });
  }
  next();
};

// Middleware to check admin privileges (for future features)
const requireAdmin = (req, res, next) => {
  // This could be expanded to check for admin roles
  // For now, we'll check if username is 'admin'
  if (req.user?.username !== 'admin') {
    return res.status(403).json({
      error: 'Admin Access Required',
      message: 'Administrator privileges required'
    });
  }
  next();
};

// Rate limiting per user (in addition to IP-based rate limiting)
const userRateLimit = (maxRequests = 60, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create user's request history
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const userHistory = userRequests.get(userId);
    
    // Remove old requests outside the window
    const recentRequests = userHistory.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'User rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    userRequests.set(userId, recentRequests);

    next();
  };
};

// Middleware to validate request body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    req.body = value;
    next();
  };
};

// Middleware to sanitize input
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS and injection attempts
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    Object.entries(obj).forEach(([key, value]) => {
      sanitized[key] = sanitizeObject(value);
    });
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Middleware to log user actions (for security auditing)
const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful actions for authenticated users
      if (req.user && res.statusCode < 400) {
        console.log(`[AUDIT] User ${req.user.username} (${req.user.id}) performed ${action} on ${req.method} ${req.path}`);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVerification,
  requireAdmin,
  userRateLimit,
  validateBody,
  sanitizeInput,
  auditLog
};
