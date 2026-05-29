import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found. Invalid token.',
          statusCode: 401,
        });
      }

      next(); // THIS WAS MISSING

    } catch (error) {
      console.error('Token verification failed:', error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please log in again.',
          statusCode: 401,
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Not authorized. Invalid token.',
        statusCode: 401,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized. No token provided.',
      statusCode: 401,
    });
  }
};

export default protect;