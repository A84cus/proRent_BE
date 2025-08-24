// validations/reviewValidation.ts
import { z } from 'zod';

// --- Validation Schema for Create Review Input ---
export const createReviewInputSchema = z.object({
   userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

   reservationId: z
      .string({ message: 'Reservation ID must be a string' })
      .min(1, { message: 'Reservation ID is required' }),

   content: z
      .string({ message: 'Review content must be a string' })
      .min(1, { message: 'Review content is required' })
      .max(1000, { message: 'Review content cannot exceed 1000 characters' }),

   rating: z
      .number({ message: 'Rating must be a number' })
      .int({ message: 'Rating must be an integer' })
      .min(1, { message: 'Rating must be at least 1' })
      .max(5, { message: 'Rating cannot exceed 5' })
});

// --- Validation Schema for Reply to Review Input ---
export const replyToReviewInputSchema = z.object({
   OwnerId: z.string({ message: 'Owner ID must be a string' }).min(1, { message: 'Owner ID is required' }),

   reviewId: z.string({ message: 'Review ID must be a string' }).min(1, { message: 'Review ID is required' }),

   content: z
      .string({ message: 'Reply content must be a string' })
      .min(1, { message: 'Reply content is required' })
      .max(1000, { message: 'Reply content cannot exceed 1000 characters' })
});

// --- Validation Schema for Update Review Visibility Input ---
export const updateReviewVisibilitySchema = z.object({
   ownerId: z.string({ message: 'Owner ID must be a string' }).min(1, { message: 'Owner ID is required' }),

   reviewId: z.string({ message: 'Review ID must be a string' }).min(1, { message: 'Review ID is required' }),

   visibility: z.boolean({ message: 'Visibility must be a boolean' })
});

export const replyToReviewBodySchema = z.object({
   content: z
      .string({ message: 'Reply content must be a string' })
      .min(1, { message: 'Reply content is required' })
      .max(1000, { message: 'Reply content cannot exceed 1000 characters' })
   // OwnerId and reviewId are NOT part of the body and thus NOT validated here
});

// --- Type Inference ---
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
// Update the type inference for the reply body
export type ReplyToReviewBodyInput = z.infer<typeof replyToReviewBodySchema>;
// Keep the original type if needed for other uses
export type ReplyToReviewInput = z.infer<typeof replyToReviewInputSchema>; // This might be deprecated/unused now
export type UpdateReviewVisibilityInput = z.infer<typeof updateReviewVisibilitySchema>;

// --- Safe Parsing Helpers ---
export function safeParseCreateReview (data: unknown) {
   return createReviewInputSchema.safeParse(data);
}

// Add a new safe parse helper for the reply body
export function safeParseReplyToReviewBody (data: unknown) {
   return replyToReviewBodySchema.safeParse(data);
}

// Keep the old one if needed for other uses, or remove if only used for reply
export function safeParseReplyToReview (data: unknown) {
   // Consider if this is still needed. If reply logic changes, maybe remove this.
   // For now, it validates the old combined schema which might be incorrect for the route.
   // It's better to use safeParseReplyToReviewBody for the reply route.
   return replyToReviewInputSchema.safeParse(data);
}

export function safeParseUpdateVisibility (data: unknown) {
   return updateReviewVisibilitySchema.safeParse(data);
}
