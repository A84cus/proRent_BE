"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.replyToReview = replyToReview;
// services/reviewService.ts
const prisma_1 = __importDefault(require("../../prisma")); // Adjust path
const client_1 = require("@prisma/client");
// --- Helper: Validate Review Creation Conditions ---
function validateReviewCreation(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { userId, reservationId } = data;
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                User: { select: { id: true } }, // Reviewer
                Property: { select: { id: true, OwnerId: true } },
                review: { select: { id: true } } // Check if review already exists
            }
        });
        if (!reservation) {
            throw new Error('Reservation not found.');
        }
        if (((_a = reservation.User) === null || _a === void 0 ? void 0 : _a.id) !== userId) {
            throw new Error('Unauthorized: You can only review your own reservations.');
        }
        if (reservation.review) {
            throw new Error('A review already exists for this reservation.');
        }
        if (reservation.orderStatus !== client_1.Status.CONFIRMED) {
            throw new Error('Only confirmed reservations can be reviewed.');
        }
        const today = new Date();
        const reservationEndDate = new Date(reservation.endDate);
        if (today <= reservationEndDate) {
            throw new Error('Reviews can only be submitted after the reservation end date.');
        }
    });
}
// --- Service: Create a Review ---
function createReview(input) {
    return __awaiter(this, void 0, void 0, function* () {
        yield validateReviewCreation(input);
        const { userId, reservationId, content, rating } = input;
        // Fetch reservation again to get propertyId for relation
        const reservation = yield prisma_1.default.reservation.findUniqueOrThrow({
            where: { id: reservationId },
            select: { propertyId: true, userId: true } // userId is revieweeId
        });
        const newReview = yield prisma_1.default.review.create({
            data: {
                content,
                rating,
                reviewer: { connect: { id: userId } }, // User writing the review (Reviewer relation)
                reviewee: { connect: { id: reservation.userId } }, // User who made the reservation (Reviewee relation)
                reservation: { connect: { id: reservationId } }
                // Property relation is implicit via reservation
            },
            include: {
                reviewer: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
                reservation: {
                    select: { id: true, startDate: true, endDate: true, Property: { select: { id: true, name: true } } }
                }
            }
        });
        return newReview;
    });
}
// --- Helper: Validate Owner Reply Conditions ---
function validateOwnerReply(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { OwnerId, reviewId } = data;
        const review = yield prisma_1.default.review.findUnique({
            where: { id: reviewId },
            include: { reservation: { select: { Property: { select: { OwnerId: true } } } } }
        });
        if (!review) {
            throw new Error('Review not found.');
        }
        if (((_b = (_a = review.reservation) === null || _a === void 0 ? void 0 : _a.Property) === null || _b === void 0 ? void 0 : _b.OwnerId) !== OwnerId) {
            throw new Error('Unauthorized: You can only reply to reviews for your own properties.');
        }
    });
}
// --- Service: Owner Replies to a Review ---
function replyToReview(input) {
    return __awaiter(this, void 0, void 0, function* () {
        yield validateOwnerReply(input);
        const { reviewId, content } = input;
        // Use upsert to create or update the reply
        const ownerReply = yield prisma_1.default.ownerReply.upsert({
            where: { reviewId },
            update: { content },
            create: {
                content,
                review: { connect: { id: reviewId } },
                id: input.OwnerId
            },
            include: {
                review: {
                    include: {
                        reviewer: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
                        reservation: { select: { Property: { select: { name: true } } } }
                    }
                }
            }
        });
        return ownerReply;
    });
}
