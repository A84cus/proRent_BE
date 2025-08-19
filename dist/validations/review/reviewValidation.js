"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewQuerySchema = exports.reviewUpdateSchema = exports.reviewCreateSchema = void 0;
exports.validateReviewRating = validateReviewRating;
exports.validateReviewComment = validateReviewComment;
exports.validateReviewOwnership = validateReviewOwnership;
const zod_1 = require("zod");
// Review validation schemas
exports.reviewCreateSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid("Invalid property ID format"),
    rating: zod_1.z
        .number()
        .int()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must not exceed 5"),
    comment: zod_1.z
        .string()
        .min(10, "Comment must be at least 10 characters")
        .max(1000, "Comment must not exceed 1000 characters"),
});
exports.reviewUpdateSchema = zod_1.z.object({
    rating: zod_1.z
        .number()
        .int()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must not exceed 5")
        .optional(),
    comment: zod_1.z
        .string()
        .min(10, "Comment must be at least 10 characters")
        .max(1000, "Comment must not exceed 1000 characters")
        .optional(),
});
exports.reviewQuerySchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid("Invalid property ID format").optional(),
    userId: zod_1.z.string().uuid("Invalid user ID format").optional(),
    rating: zod_1.z.number().int().min(1).max(5).optional(),
    page: zod_1.z.number().int().min(1).default(1).optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(10).optional(),
});
// Review validation functions
function validateReviewRating(rating) {
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
function validateReviewComment(comment) {
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
function validateReviewOwnership(reviewUserId, currentUserId) {
    if (reviewUserId !== currentUserId) {
        return {
            isValid: false,
            error: "You can only modify your own reviews",
        };
    }
    return { isValid: true };
}
