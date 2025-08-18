// src/validations/paymentProofSchema.ts
import { z } from 'zod';

export const paymentProofFileSchema = z.object({
   originalname: z
      .string()
      .min(1, { message: 'Filename is required.' })
      .refine(
         filename => {
            const ext = filename.split('.').pop()?.toLowerCase();
            return ext && [ 'jpg', 'jpeg', 'png' ].includes(ext);
         },
         { message: 'Invalid file type. Only .jpg, .jpeg, and .png files are allowed for payment proofs.' }
      ),
   size: z
      .number()
      .int()
      .positive({ message: 'File size must be a positive number.' })
      .max(1 * 1024 * 1024, { message: 'File size exceeds the maximum allowed size of 1MB.' }), // 1MB

   alt: z.string().optional(),
   type: z.literal('proof').optional()
});

export type PaymentProofFileInput = z.infer<typeof paymentProofFileSchema>;
