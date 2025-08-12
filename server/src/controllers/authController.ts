import { Request, Response, NextFunction } from 'express';
import { UserModel, UserProfileModel } from '@/models/User';
import { generateTokens, comparePassword } from '@/utils/auth';
import { createError } from '@/middleware/errorHandler';
import { RegisterRequest, LoginRequest, AuthResponse } from '@/types';
import { logger } from '@/utils/logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await UserModel.emailExists(email);
    if (existingUser) {
      throw createError('User with this email already exists', 400);
    }

    // Create user
    const user = await UserModel.create({ email, password, name });
    
    // Create user profile
    await UserProfileModel.create(user.id);

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    // Prepare response
    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastActive: user.lastActive,
        isVerified: user.isVerified,
      },
      tokens,
    };

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      data: response,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    // Update last active
    await UserModel.updateLastActive(user.id);

    // Prepare response
    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastActive: user.lastActive,
        isVerified: user.isVerified,
      },
      tokens,
    };

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw createError('User not found', 404);
    }

    const profile = await UserProfileModel.findByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const updates = req.body;
    const profile = await UserProfileModel.update(req.user.id, updates);

    if (!profile) {
      throw createError('Profile not found', 404);
    }

    logger.info(`Profile updated for user: ${req.user.email}`);

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a production app, you'd invalidate the refresh token here
    // For now, we'll just return success since JWT tokens are stateless
    
    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};