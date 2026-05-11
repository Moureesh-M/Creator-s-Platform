import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'

export const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1]
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized, no token', 401))
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.userId).select('-password')

    if (!req.user) {
      return next(new AppError('User not found', 401))
    }

    // Continue to next middleware/route
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return next(new AppError('Not authorized, token failed', 401))
  }
}
