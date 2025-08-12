import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

// MCP JSON-RPC validation schema
const mcpRequestSchema = Joi.object({
  jsonrpc: Joi.string().valid('2.0').required(),
  id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  method: Joi.string().required(),
  params: Joi.object().optional()
});

const mcpNotificationSchema = Joi.object({
  jsonrpc: Joi.string().valid('2.0').required(),
  method: Joi.string().required(),
  params: Joi.object().optional()
});

export const validateMCPRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error } = mcpRequestSchema.validate(req.body);
  
  if (error) {
    logger.warn('Invalid MCP request format', { 
      error: error.details[0].message,
      body: req.body 
    });
    
    return res.status(400).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32600,
        message: 'Invalid Request',
        data: error.details[0].message
      }
    });
  }
  
  next();
};

export const validateMCPNotification = (req: Request, res: Response, next: NextFunction) => {
  const { error } = mcpNotificationSchema.validate(req.body);
  
  if (error) {
    logger.warn('Invalid MCP notification format', { 
      error: error.details[0].message,
      body: req.body 
    });
    
    return res.status(400).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32600,
        message: 'Invalid Request',
        data: error.details[0].message
      }
    });
  }
  
  next();
};

export const validateHealthCheck = (req: Request, res: Response, next: NextFunction) => {
  // Health check endpoints don't need validation
  next();
};