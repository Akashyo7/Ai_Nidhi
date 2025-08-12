import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: -32001 
    });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      logger.warn('Invalid token attempt', { token: token.substring(0, 10) + '...' });
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: -32002 
      });
    }
    
    req.user = user;
    next();
  });
};

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.MCP_API_KEY;

  if (!validApiKey) {
    logger.error('MCP_API_KEY not configured');
    return res.status(500).json({
      error: 'Server configuration error',
      code: -32603
    });
  }

  if (!apiKey || apiKey !== validApiKey) {
    logger.warn('Invalid API key attempt', { 
      providedKey: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
      ip: req.ip 
    });
    return res.status(401).json({
      error: 'Invalid API key',
      code: -32001
    });
  }

  next();
};