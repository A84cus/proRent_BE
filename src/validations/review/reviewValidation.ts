import { z } from "zod";

// Review validation schemas
export const reviewCreateSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must not exceed 1000 characters"),
});

export const reviewUpdateSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5")
    .optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must not exceed 1000 characters")
    .optional(),
});

export const reviewQuerySchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format").optional(),
  userId: z.string().uuid("Invalid user ID format").optional(),
  rating: z.number().int().min(1).max(5).optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
});

// Types
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;

// Review validation functions
export function validateReviewRating(rating: number): {
  isValid: boolean;
  error?: string;
} {
  if (!rating || typeof rating !== "number") {
    return {
      isValid: false,
      error: "Rating is required and must be a number",
    };
  }

  if (rating < 1 || rating > 5) {
    return {
      isValid: false,
      error: "Rating must be between 1 and 5",
    };
  }

  if (!Number.isInteger(rating)) {
    return {
      isValid: false,
      error: "Rating must be a whole number",
    };
  }

  return { isValid: true };
}

export function validateReviewComment(comment: string): {
  isValid: boolean;
  error?: string;
} {
  if (!comment || typeof comment !== "string") {
    return {
      isValid: false,
      error: "Comment is required and must be a string",
    };
  }

  const trimmedComment = comment.trim();

  if (trimmedComment.length < 10) {
    return {
      isValid: false,
      error: "Comment must be at least 10 characters long",
    };
  }

  if (trimmedComment.length > 1000) {
    return {
      isValid: false,
      error: "Comment must not exceed 1000 characters",
    };
  }

  return { isValid: true };
}

export function validateReviewOwnership(
  reviewUserId: string,
  currentUserId: string
): { isValid: boolean; error?: string } {
  if (reviewUserId !== currentUserId) {
    return {
      isValid: false,
      error: "You can only modify your own reviews",
    };
  }

  return { isValid: true };
}
