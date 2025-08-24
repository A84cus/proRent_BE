"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToReviewBodySchema = exports.updateReviewVisibilitySchema = exports.replyToReviewInputSchema = exports.createReviewInputSchema = void 0;
exports.safeParseCreateReview = safeParseCreateReview;
exports.safeParseReplyToReviewBody = safeParseReplyToReviewBody;
exports.safeParseReplyToReview = safeParseReplyToReview;
exports.safeParseUpdateVisibility = safeParseUpdateVisibility;
// validations/reviewValidation.ts
const zod_1 = require("zod");
// --- Validation Schema for Create Review Input ---
exports.createReviewInputSchema = zod_1.z.object({
    userId: zod_1.z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),
    reservationId: zod_1.z
        .string({ message: 'Reservation ID must be a string' })
        .min(1, { message: 'Reservation ID is required' }),
    content: zod_1.z
        .string({ message: 'Review content must be a string' })
        .min(1, { message: 'Review content is required' })
        .max(1000, { message: 'Review content cannot exceed 1000 characters' }),
    rating: zod_1.z
        .number({ message: 'Rating must be a number' })
        .int({ message: 'Rating must be an integer' })
        .min(1, { message: 'Rating must be at least 1' })
        .max(5, { message: 'Rating cannot exceed 5' })
});
// --- Validation Schema for Reply to Review Input ---
exports.replyToReviewInputSchema = zod_1.z.object({
    OwnerId: zod_1.z.string({ message: 'Owner ID must be a string' }).min(1, { message: 'Owner ID is required' }),
    reviewId: zod_1.z.string({ message: 'Review ID must be a string' }).min(1, { message: 'Review ID is required' }),
    content: zod_1.z
        .string({ message: 'Reply content must be a string' })
        .min(1, { message: 'Reply content is required' })
        .max(1000, { message: 'Reply content cannot exceed 1000 characters' })
});
// --- Validation Schema for Update Review Visibility Input ---
exports.updateReviewVisibilitySchema = zod_1.z.object({
    ownerId: zod_1.z.string({ message: 'Owner ID must be a string' }).min(1, { message: 'Owner ID is required' }),
    reviewId: zod_1.z.string({ message: 'Review ID must be a string' }).min(1, { message: 'Review ID is required' }),
    visibility: zod_1.z.boolean({ message: 'Visibility must be a boolean' })
});
exports.replyToReviewBodySchema = zod_1.z.object({
    content: zod_1.z
        .string({ message: 'Reply content must be a string' })
        .min(1, { message: 'Reply content is required' })
        .max(1000, { message: 'Reply content cannot exceed 1000 characters' })
    // OwnerId and reviewId are NOT part of the body and thus NOT validated here
});
// --- Safe Parsing Helpers ---
function safeParseCreateReview(data) {
    return exports.createReviewInputSchema.safeParse(data);
}
// Add a new safe parse helper for the reply body
function safeParseReplyToReviewBody(data) {
    return exports.replyToReviewBodySchema.safeParse(data);
}
// Keep the old one if needed for other uses, or remove if only used for reply
function safeParseReplyToReview(data) {
    // Consider if this is still needed. If reply logic changes, maybe remove this.
    // For now, it validates the old combined schema which might be incorrect for the route.
    // It's better to use safeParseReplyToReviewBody for the reply route.
    return exports.replyToReviewInputSchema.safeParse(data);
}
function safeParseUpdateVisibility(data) {
    return exports.updateReviewVisibilitySchema.safeParse(data);
}
