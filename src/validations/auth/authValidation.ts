import { z } from 'zod';

// Authentication validation schemas
export const registerUserSchema = z.object({
   email: z.email('Invalid email format'),
   role: z.enum([ 'USER', 'OWNER' ]),
   password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
   socialLogin: z.enum([ 'GOOGLE', 'FACEBOOK', 'TWITTER', 'NONE' ]).optional()
});

export const verifyEmailSchema = z.object({
   token: z.string().min(1, 'Token is required')
});

export const resendVerificationSchema = z.object({
   email: z.email('Invalid email format')
});

export const loginSchema = z
   .object({
      email: z.email('Invalid email format'),
      password: z.string().optional(),
      socialLogin: z.enum([ 'GOOGLE', 'FACEBOOK', 'TWITTER', 'NONE' ]).optional()
   })
   .refine(data => data.password || (data.socialLogin && data.socialLogin !== 'NONE'), {
      message: 'Either password or social login method must be provided'
   });

export const resetPasswordRequestSchema = z.object({
   email: z.email('Invalid email format')
});

export const resetPasswordConfirmSchema = z.object({
   token: z.string().min(1, 'Token is required'),
   newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
         'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      )
});
