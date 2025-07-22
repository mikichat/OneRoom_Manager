const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 디버그 로그 함수
const debugLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH_DEBUG]', ...args);
  }
};

const protect = async (req, res, next) => {
  let token;
  debugLog('Protect middleware triggered');

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      debugLog('Token found:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      debugLog('Token decoded:', decoded);

      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      debugLog('User found:', req.user ? req.user.toJSON() : 'null');

      if (!req.user) {
        debugLog('User not found in DB, sending 401');
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      debugLog('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    debugLog('No authorization header or does not start with Bearer');
    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    debugLog(`Authorize roles middleware triggered for roles: ${roles.join(', ')}`);
    if (!req.user) {
      debugLog('No user object in request, sending 404 as per new logic');
      return res.status(404).json({ message: 'Resource not found (user not authenticated)' });
    }
    debugLog(`User role: ${req.user.role}`);
    if (!roles.includes(req.user.role)) {
      debugLog(`User role '${req.user.role}' is not in allowed roles, sending 404`);
      return res.status(404).json({ message: `Resource not found (role not authorized)` });
    }
    debugLog('User is authorized, proceeding to next middleware');
    next();
  };
};

module.exports = { protect, authorizeRoles }; 