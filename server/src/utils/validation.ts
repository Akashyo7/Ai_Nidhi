import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  profession: z.string().max(255, 'Profession too long').optional(),
  goals: z.array(z.string()).max(10, 'Too many goals').optional(),
  brandingObjectives: z.array(z.string()).max(10, 'Too many branding objectives').optional(),
  contextBox: z.string().max(5000, 'Context box too long').optional(),
  socialMediaHandles: z.array(z.object({
    platform: z.string(),
    handle: z.string(),
    url: z.string().url('Invalid URL'),
    isVerified: z.boolean(),
  })).max(10, 'Too many social media handles').optional(),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};