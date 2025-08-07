import { z } from 'zod';

// Utility validation schemas
export const uploadFileSchema = z.object({
   type: z.enum([ 'profile', 'property', 'room', 'proof' ], {
      message: 'Type must be one of: profile, property, room, proof'
   }),
   alt: z.string().optional(),
   description: z.string().optional()
});

export const sendEmailSchema = z
   .object({
      to: z.email('Invalid email format'),
      subject: z.string().min(1, 'Subject is required'),
      text: z.string().optional(),
      html: z.string().optional()
   })
   .refine(data => data.text || data.html, {
      message: 'Either text or html content must be provided'
   });

export const testEmailSchema = z.object({
   to: z.email('Invalid email format'),
   subject: z.string().min(1, 'Subject is required'),
   type: z.enum([ 'verification', 'reset', 'welcome', 'custom' ], {
      message: 'Type must be one of: verification, reset, welcome, custom'
   }),
   customHtml: z.string().optional()
});

export const resendEmailSchema = z.object({
   email: z.email('Invalid email format'),
   type: z.enum([ 'verification', 'reset' ], {
      message: 'Type must be verification or reset'
   })
});
