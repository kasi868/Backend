const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding the password)
      req.user = await User.findById(decoded.id).populate('restaurantId').select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if the user account itself is active
      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
      }

      // If the user is an admin or employee, check their restaurant's status
      if (req.user.role === 'admin' || req.user.role === 'employee') {
        const restaurant = req.user.restaurantId;
        if (!restaurant || !restaurant.isActive) {
          return res.status(403).json({ message: 'Restaurant is inactive. Please contact your administrator.' });
        }
        if (restaurant.subscriptionExpiresAt && new Date() > new Date(restaurant.subscriptionExpiresAt)) {
          return res.status(403).json({ message: 'Restaurant subscription has expired.' });
        }
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  // The 'protect' middleware must run first to attach 'req.user'
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Middleware to restrict access to superadmin only
const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a superadmin' });
  }
};

module.exports = { protect, admin, superadmin };