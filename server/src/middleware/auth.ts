import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/utils/auth';
import { UserModel } from '@/models/User';
import { createError } from '@/middleware/errorHandler';
import { JWTPayload } from '@/types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw createError('Access token required', 401);
    }

    const decoded: JWTPayload = verifyToken(token);
    
    // Verify user still exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw createError('User not found', 401);
    }

    // Update last active timestamp
    await UserModel.updateLastActive(user.id);

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(createError(error.message, 401));
    } else {
      next(createError('Authentication failed', 401));
    }
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded: JWTPayload = verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      
      if (user) {
        await UserModel.updateLastActive(user.id);
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};